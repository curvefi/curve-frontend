import { test } from 'vest'
import { calculateExpectedBurn, calculateMaximumBurn, LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import type { PoolQuery, UserQuery } from '@/stellar/queries/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
import { getPoolAmounts, getPoolMaxAmounts } from '@ui/features/pool-forms/pool-form.utils'
import type { WithdrawFormValues, WithdrawMutation } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import type { DeepPartial } from '@ui/features/queries/util'
import { decimalGreaterThan, decimalMinus } from '@ui/lib/decimal'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'
import {
  validateAmount,
  validateLiquidityInputs,
  validateReserveAmounts,
  validateSlippage,
  type QuoteQuery,
} from './liquidity.validation'
import { validateAccount, validatePool } from './pool.validation'

export type { WithdrawMutation } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'

export type WithdrawQuery = PoolQuery & UserQuery & WithdrawMutation
export type WithdrawParams = FieldsOf<DeepPartial<WithdrawQuery>>

export type WithdrawSimulationQuery = QuoteQuery &
  UserQuery & {
    lpAmount: Decimal
    maxLpAmount: Decimal
    seedLock: Decimal
    maxAmounts: (Decimal | undefined)[]
    quote: Decimal
    maxBurn: Decimal
    slippage: Decimal
  }
export type WithdrawSimulationParams = FieldsOf<DeepPartial<WithdrawSimulationQuery>>

const validateOutputs = (params: Pick<WithdrawSimulationParams, 'amounts' | 'decimals' | 'supply' | 'maxAmounts'>) => {
  validateLiquidityInputs(params, false)
  validateReserveAmounts(params)
}

const validateBudget = ({
  lpAmount,
  maxLpAmount,
  supply,
  seedLock,
}: Pick<WithdrawSimulationParams, 'lpAmount' | 'maxLpAmount' | 'supply' | 'seedLock'>) => {
  validateAmount('lpAmount', lpAmount ?? undefined, LP_TOKEN_DECIMALS)
  test('lpAmount', 'Enter an LP amount', () => {
    enforce(lpAmount).isDecimal().gt(0)
  })
  test('maxLpAmount', 'LP balance is unavailable', () => {
    enforce(maxLpAmount).isDecimal().gte(0)
  })
  test('lpAmount', 'Insufficient LP balance', () => {
    enforce(!decimalGreaterThan(lpAmount ?? '0', maxLpAmount ?? '0')).isTruthy()
  })
  test('seedLock', 'Locked liquidity is unavailable', () => {
    enforce(seedLock).isDecimal().gte(0)
  })
  test('lpAmount', 'Withdrawal exceeds the redeemable LP supply', () => {
    enforce(!decimalGreaterThan(lpAmount ?? '0', decimalMinus(supply ?? '0', seedLock ?? '0'))).isTruthy()
  })
}

const validateMaximumBurn = (lpAmount: Decimal | null | undefined, maxBurn: Decimal | null | undefined) => {
  validateAmount('root', maxBurn ?? undefined, LP_TOKEN_DECIMALS)
  test('maximumBurn', 'Withdrawal quote is unavailable', () => {
    enforce(maxBurn).isDecimal().gt(0)
  })
  test('root', 'Withdrawal is too small to burn LP', () => {
    if (maxBurn != null) enforce(maxBurn).isDecimal().gt(0)
  })
  test('root', 'Maximum LP required exceeds the LP amount. Reduce the token amounts or increase the LP amount.', () => {
    enforce(!decimalGreaterThan(maxBurn ?? '0', lpAmount ?? '0')).isTruthy()
  })
}

export const withdrawFormValidationSuite = createValidationSuite((values: WithdrawFormValues) => {
  validateSlippage(values.slippage)
  validateOutputs({
    ...values,
    amounts: getPoolAmounts(values, values.decimals?.length),
    maxAmounts: getPoolMaxAmounts(values, values.decimals?.length),
  })
  validateBudget(values)
  validateMaximumBurn(values.lpAmount, values.maximumBurn)
})

const validateWithdraw = (params: WithdrawSimulationParams) => {
  validatePool(params)
  validateAccount(params.account)
  validateSlippage(params.slippage ?? undefined)
  validateOutputs(params)
  validateBudget(params)
  validateMaximumBurn(params.lpAmount, params.maxBurn)
  test('quote', 'Withdrawal is too small to burn LP', () => {
    enforce(params.quote).isDecimal().gt(0)
  })
  test('maxBurn', 'Maximum LP does not match the accepted quote and slippage', () => {
    enforce(calculateMaximumBurn(calculateExpectedBurn(params.quote!), params.slippage!)).equals(params.maxBurn)
  })
}

export const withdrawSimulationValidationSuite = createValidationSuite(validateWithdraw)
export const withdrawValidationSuite = createValidationSuite((params: WithdrawParams) => {
  validateWithdraw({ ...params, maxBurn: params.maximumBurn })
})
