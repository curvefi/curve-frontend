import { BigNumber } from 'bignumber.js'
import { skipWhen, test } from 'vest'
import type { WithdrawSimulationParams, WithdrawSimulationQuery } from '@/stellar/features/withdraw/types'
import { calculateMaximumBurn, LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { isComplete } from '@primitives/array.utils'
import { maybes } from '@primitives/objects.utils'
import { getPoolAmounts, getPoolMaxAmounts } from '@ui/features/pool-forms/pool-form.utils'
import {
  getSingleCoinWithdrawIndex,
  type WithdrawFormValues,
} from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { decimalEqual, decimalMinus, decimalRound } from '@ui/lib/decimal'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { validateSlippage } from '@ui/lib/validation/slippage.validation'
import { validateLiquidityInputs, validateLpAmount, validateMaxAmounts } from './liquidity.validation'
import { validateAccount, validatePool } from './pool.validation'

const validateOutputs = ({
  amounts,
  decimals,
  supply,
  maxAmounts,
  isBalanced,
}: Pick<WithdrawSimulationParams, 'amounts' | 'decimals' | 'supply' | 'maxAmounts' | 'isBalanced'>) => {
  validateLiquidityInputs({ amounts, decimals, supply, isDeposit: false })
  skipWhen(!isBalanced, () => {
    test('root', 'Missing balanced withdrawal amounts', () => {
      enforce(isComplete(amounts)).isTruthy()
    })
  })
  skipWhen(!!isBalanced, () => validateMaxAmounts({ amounts, maxAmounts }))
}

const validateBudget = ({
  lpAmount,
  maxLpAmount,
  supply,
  seedLock,
}: Pick<WithdrawSimulationParams, 'lpAmount' | 'maxLpAmount' | 'supply' | 'seedLock'>) => {
  validateLpAmount(lpAmount)
  test('maxLpAmount', 'LP balance is unavailable', () => {
    enforce(maxLpAmount).isDecimal().gte(0)
  })
  test('lpAmount', 'Insufficient LP balance', () => {
    enforce(maybes([lpAmount, maxLpAmount], (amount, balance) => new BigNumber(amount).lte(balance))).isTruthy()
  })
  test('seedLock', 'Locked liquidity is unavailable', () => {
    enforce(seedLock).isDecimal().gte(0)
  })
  test('lpAmount', 'Withdrawal exceeds the redeemable LP supply', () => {
    enforce(
      maybes([lpAmount, supply, seedLock], (amount, supply, seedLock) =>
        new BigNumber(amount).lte(decimalMinus(supply, seedLock)),
      ),
    ).isTruthy()
  })
}

const validateMaximumBurn = ({
  lpAmount,
  maximumBurn,
  isExactBurn,
}: Pick<WithdrawSimulationParams, 'lpAmount' | 'maximumBurn'> & { isExactBurn: boolean }) => {
  test('maximumBurn', 'Withdrawal quote is unavailable', () => {
    enforce(maximumBurn).isDecimal().gt(0)
  })
  test('root', 'Maximum LP required exceeds the LP amount. Reduce the token amounts or increase the LP amount.', () => {
    enforce(maybes([maximumBurn, lpAmount], (burn, budget) => new BigNumber(burn).lte(budget))).isTruthy()
  })
  skipWhen(!isExactBurn, () => {
    test('maximumBurn', 'LP burn does not match the selected LP amount', () => {
      enforce(
        maybes([maximumBurn, lpAmount], (burn, amount) => decimalEqual(burn, decimalRound(amount, LP_TOKEN_DECIMALS))),
      ).isTruthy()
    })
  })
}

const validateMaxSelection = (
  params: Pick<WithdrawSimulationParams, 'amounts' | 'maxWithdrawIndex' | 'lpAmount' | 'maxLpAmount' | 'isBalanced'>,
) => {
  const index = getSingleCoinWithdrawIndex(params)
  skipWhen(params.maxWithdrawIndex == null, () => {
    test('root', 'Max withdrawal requires the full LP balance and a single token output', () => {
      enforce(params.isBalanced).isFalsy()
      enforce(index).equals(params.maxWithdrawIndex)
      enforce(
        params.amounts?.every((amount, i) => (i === index ? +(amount ?? '0') > 0 : decimalEqual(amount ?? '0', '0'))),
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
    isBalanced,
    ...values
  }: WithdrawFormValues) => {
    validateSlippage({ slippage })
    const amounts = getPoolAmounts(values, decimals?.length)
    validateOutputs({ amounts, maxAmounts: getPoolMaxAmounts(values, decimals?.length), decimals, supply, isBalanced })
    validateBudget({ lpAmount, maxLpAmount, supply, seedLock })
    const singleCoinIndex = validateMaxSelection({ amounts, maxWithdrawIndex, lpAmount, maxLpAmount, isBalanced })
    validateMaximumBurn({ lpAmount, maximumBurn, isExactBurn: isBalanced || singleCoinIndex != null })
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
  isBalanced,
}: WithdrawSimulationQuery) => {
  validatePool({ network, pool })
  validateAccount(account)
  validateSlippage({ slippage })
  validateOutputs({ amounts, decimals, supply, maxAmounts, isBalanced })
  validateBudget({ lpAmount, maxLpAmount, supply, seedLock })
  const singleCoinIndex = validateMaxSelection({ amounts, maxWithdrawIndex, lpAmount, maxLpAmount, isBalanced })
  const isExactBurn = isBalanced || singleCoinIndex != null
  validateMaximumBurn({ lpAmount, maximumBurn, isExactBurn })
  test('expected', 'Withdrawal is too small to burn LP', () => {
    enforce(expected).isDecimal().gt(0)
  })
  skipWhen(!isExactBurn, () => {
    test('expected', 'LP quote does not match the selected LP amount', () => {
      enforce(decimalEqual(expected, decimalRound(lpAmount, LP_TOKEN_DECIMALS))).isTruthy()
    })
  })
  skipWhen(isExactBurn, () => {
    test('maximumBurn', 'Maximum LP does not match the accepted quote and slippage', () => {
      enforce(maybes([expected, slippage], calculateMaximumBurn)).equals(maximumBurn)
    })
  })
}

export const withdrawSimulationValidationSuite = createValidationSuite(validateWithdraw)
export const withdrawValidationSuite = createValidationSuite(validateWithdraw)
