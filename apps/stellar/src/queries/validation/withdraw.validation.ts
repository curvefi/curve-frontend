import { skipWhen, test } from 'vest'
import type { WithdrawSimulationParams } from '@/stellar/features/withdraw/types'
import { calculateExpectedBurn, calculateMaximumBurn, LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { maybe, maybes } from '@primitives/objects.utils'
import { getPoolAmounts, getPoolMaxAmounts } from '@ui/features/pool-forms/pool-form.utils'
import type { WithdrawFormValues } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import {
  validateAmount,
  validateLiquidityInputs,
  validateReserveAmounts,
  validateSlippage,
} from './liquidity.validation'
import { validateAccount, validatePool } from './pool.validation'

const validateOutputs = ({
  amounts,
  decimals,
  supply,
  maxAmounts,
}: Pick<WithdrawSimulationParams, 'amounts' | 'decimals' | 'supply' | 'maxAmounts'>) => {
  validateLiquidityInputs({ amounts, decimals, supply, isDeposit: false })
  validateReserveAmounts({ amounts, maxAmounts })
}

const validateBudget = ({
  lpAmount,
  maxLpAmount,
  supply,
  seedLock,
}: Pick<WithdrawSimulationParams, 'lpAmount' | 'maxLpAmount' | 'supply' | 'seedLock'>) => {
  validateAmount('lpAmount', lpAmount, LP_TOKEN_DECIMALS)
  test('lpAmount', 'Enter an LP amount', () => {
    enforce(lpAmount).isDecimal().gt(0)
  })
  test('maxLpAmount', 'LP balance is unavailable', () => {
    enforce(maxLpAmount).isDecimal().gte(0)
  })
  test('lpAmount', 'Insufficient LP balance', () => {
    enforce(maybe(lpAmount, amount => +amount)).lte(maybe(maxLpAmount, amount => +amount))
  })
  test('seedLock', 'Locked liquidity is unavailable', () => {
    enforce(seedLock).isDecimal().gte(0)
  })
  test('lpAmount', 'Withdrawal exceeds the redeemable LP supply', () => {
    enforce(maybe(lpAmount, amount => +amount)).lte(
      maybes([supply, seedLock], (supply, seedLock) => +supply - +seedLock),
    )
  })
}

const validateMaximumBurn = ({ lpAmount, maximumBurn }: Pick<WithdrawSimulationParams, 'lpAmount' | 'maximumBurn'>) => {
  validateAmount('root', maximumBurn, LP_TOKEN_DECIMALS)
  test('maximumBurn', 'Withdrawal quote is unavailable', () => {
    enforce(maximumBurn).isDecimal().gt(0)
  })
  skipWhen(maximumBurn == null, () => {
    test('root', 'Withdrawal is too small to burn LP', () => {
      enforce(maximumBurn).isDecimal().gt(0)
    })
  })
  test('root', 'Maximum LP required exceeds the LP amount. Reduce the token amounts or increase the LP amount.', () => {
    enforce(maybe(maximumBurn, amount => +amount)).lte(maybe(lpAmount, amount => +amount))
  })
}

export const withdrawFormValidationSuite = createValidationSuite(
  ({ slippage, decimals, supply, lpAmount, maxLpAmount, seedLock, maximumBurn, ...values }: WithdrawFormValues) => {
    validateSlippage(slippage)
    validateOutputs({
      decimals,
      supply,
      amounts: getPoolAmounts(values, decimals?.length),
      maxAmounts: getPoolMaxAmounts(values, decimals?.length),
    })
    validateBudget({ lpAmount, maxLpAmount, supply, seedLock })
    validateMaximumBurn({ lpAmount, maximumBurn })
  },
)

const validateWithdraw = ({
  pool,
  network,
  account,
  slippage,
  amounts,
  decimals,
  supply,
  maxAmounts,
  lpAmount,
  maxLpAmount,
  seedLock,
  maximumBurn,
  quote,
}: WithdrawSimulationParams) => {
  validatePool({ pool, network })
  validateAccount(account)
  validateSlippage(slippage)
  validateOutputs({ amounts, decimals, supply, maxAmounts })
  validateBudget({ lpAmount, maxLpAmount, supply, seedLock })
  validateMaximumBurn({ lpAmount, maximumBurn })
  test('quote', 'Withdrawal is too small to burn LP', () => {
    enforce(quote).isDecimal().gt(0)
  })
  test('maximumBurn', 'Maximum LP does not match the accepted quote and slippage', () => {
    enforce(
      maybes([quote, slippage], (quote, slippage) => calculateMaximumBurn(calculateExpectedBurn(quote), slippage)),
    ).equals(maximumBurn)
  })
}

export const withdrawSimulationValidationSuite = createValidationSuite(validateWithdraw)
export const withdrawValidationSuite = createValidationSuite(validateWithdraw)
