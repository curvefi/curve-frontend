import { skipWhen, test } from 'vest'
import type { WithdrawSimulationParams, WithdrawSimulationQuery } from '@/stellar/features/withdraw/types'
import { calculateMaximumBurn } from '@/stellar/lib/amounts'
import { maybe, maybes } from '@primitives/objects.utils'
import { getPoolAmounts, getPoolMaxAmounts } from '@ui/features/pool-forms/pool-form.utils'
import {
  getSingleCoinWithdrawIndex,
  type WithdrawFormValues,
} from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { decimalEqual, decimalMinus } from '@ui/lib/decimal'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { validateSlippage } from '@ui/lib/validation/slippage.validation'
import { validateAmount, validateLiquidityInputs, validateMaxAmounts } from './liquidity.validation'
import { validateAccount, validatePool } from './pool.validation'

const validateOutputs = ({
  amounts,
  decimals,
  supply,
  maxAmounts,
}: Pick<WithdrawSimulationParams, 'amounts' | 'decimals' | 'supply' | 'maxAmounts'>) => {
  validateLiquidityInputs({ amounts, decimals, supply, isDeposit: false })
  validateMaxAmounts({ amounts, maxAmounts })
}

const validateBudget = ({
  lpAmount,
  maxLpAmount,
  supply,
  seedLock,
}: Pick<WithdrawSimulationParams, 'lpAmount' | 'maxLpAmount' | 'supply' | 'seedLock'>) => {
  validateAmount('lpAmount', lpAmount)
  test('lpAmount', 'Enter an LP amount', () => {
    enforce(lpAmount).isDecimal().gt(0)
  })
  test('maxLpAmount', 'LP balance is unavailable', () => {
    enforce(maxLpAmount).isDecimal().gte(0)
  })
  test('lpAmount', 'Insufficient LP balance', () => {
    enforce(maybe(lpAmount, amount => +amount)).lte(maybe(maxLpAmount, amount => +amount)!)
  })
  test('seedLock', 'Locked liquidity is unavailable', () => {
    enforce(seedLock).isDecimal().gte(0)
  })
  test('lpAmount', 'Withdrawal exceeds the redeemable LP supply', () => {
    enforce(maybe(lpAmount, amount => +amount)).lte(
      maybes([supply, seedLock], (supply, seedLock) => +decimalMinus(supply, seedLock))!,
    )
  })
}

const validateMaximumBurn = ({ lpAmount, maximumBurn }: Pick<WithdrawSimulationParams, 'lpAmount' | 'maximumBurn'>) => {
  validateAmount('root', maximumBurn)
  test('maximumBurn', 'Withdrawal quote is unavailable', () => {
    enforce(maximumBurn).isDecimal().gt(0)
  })
  skipWhen(maximumBurn == null, () => {
    test('root', 'Withdrawal is too small to burn LP', () => {
      enforce(maximumBurn).isDecimal().gt(0)
    })
  })
  test('root', 'Maximum LP required exceeds the LP amount. Reduce the token amounts or increase the LP amount.', () => {
    enforce(maybe(maximumBurn, amount => +amount)).lte(maybe(lpAmount, amount => +amount)!)
  })
}

const validateMaxSelection = (
  params: Pick<WithdrawSimulationParams, 'amounts' | 'maxWithdrawIndex' | 'lpAmount' | 'maxLpAmount'>,
) => {
  const index = getSingleCoinWithdrawIndex(params)
  skipWhen(params.maxWithdrawIndex == null, () => {
    test('root', 'Max withdrawal requires the full LP balance and a single token output', () => {
      enforce(index).equals(params.maxWithdrawIndex)
      enforce(
        params.amounts?.every((amount, i) =>
          i === index ? +(amount ?? '0') > 0 : decimalEqual(amount ?? '0', '0'),
        ),
      ).isTruthy()
    })
  })
  return index
}

export const withdrawFormValidationSuite = createValidationSuite(
  ({
    slippage,
    decimals,
    supply,
    lpAmount,
    maxLpAmount,
    maxWithdrawIndex,
    seedLock,
    maximumBurn,
    ...values
  }: WithdrawFormValues) => {
    validateSlippage({ slippage })
    const amounts = getPoolAmounts(values, decimals?.length)
    validateOutputs({ amounts, maxAmounts: getPoolMaxAmounts(values, decimals?.length), decimals, supply })
    validateBudget({ lpAmount, maxLpAmount, supply, seedLock })
    validateMaximumBurn({ lpAmount, maximumBurn })
    validateMaxSelection({ amounts, maxWithdrawIndex, lpAmount, maxLpAmount })
  },
)

const validateWithdraw = ({
  network,
  pool,
  account,
  amounts,
  decimals,
  supply,
  maxAmounts,
  lpAmount,
  maxLpAmount,
  maxWithdrawIndex,
  seedLock,
  expected,
  slippage,
  maximumBurn,
}: WithdrawSimulationQuery) => {
  validatePool({ network, pool })
  validateAccount(account)
  validateSlippage({ slippage })
  validateOutputs({ amounts, decimals, supply, maxAmounts })
  validateBudget({ lpAmount, maxLpAmount, supply, seedLock })
  validateMaximumBurn({ lpAmount, maximumBurn })
  const singleCoinIndex = validateMaxSelection({ amounts, maxWithdrawIndex, lpAmount, maxLpAmount })
  test('expected', 'Withdrawal is too small to burn LP', () => {
    enforce(expected).isDecimal().gt(0)
  })
  skipWhen(singleCoinIndex == null, () => {
    test('expected', 'LP quote does not match the maximum withdrawal', () => {
      enforce(expected).equals(lpAmount)
    })
    test('maximumBurn', 'LP burn does not match the maximum withdrawal', () => {
      enforce(maximumBurn).equals(lpAmount)
    })
  })
  skipWhen(singleCoinIndex != null, () => {
    test('maximumBurn', 'Maximum LP does not match the accepted quote and slippage', () => {
      enforce(maybes([expected, slippage], calculateMaximumBurn)).equals(maximumBurn)
    })
  })
}

export const withdrawSimulationValidationSuite = createValidationSuite(validateWithdraw)
export const withdrawValidationSuite = createValidationSuite(validateWithdraw)
