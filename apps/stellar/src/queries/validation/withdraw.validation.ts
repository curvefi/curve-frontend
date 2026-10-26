import { BigNumber } from 'bignumber.js'
import { skipWhen, test } from 'vest'
import type { WithdrawSimulationParams, WithdrawSimulationQuery } from '@/stellar/features/withdraw/types'
import { calculateMaximumBurn, LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { isComplete } from '@primitives/array.utils'
import { maybes } from '@primitives/objects.utils'
import {
  getAdvancedWithdrawParams,
  getOneCoinWithdrawParams,
  type AdvancedWithdrawFormValues,
  type OneCoinWithdrawFormValues,
} from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { decimalEqual, decimalMinus, decimalRound } from '@ui/lib/decimal'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { validateSlippage } from '@ui/lib/validation/slippage.validation'
import { validateAmount, validateLiquidityInputs, validateLpAmount, validateMaxAmounts } from './liquidity.validation'
import { validateAccount, validatePool } from './pool.validation'

const validateOutputs = ({
  amounts,
  decimals,
  supply,
  maxAmounts,
  mode,
}: Pick<WithdrawSimulationParams, 'amounts' | 'decimals' | 'supply' | 'maxAmounts' | 'mode'>) => {
  validateLiquidityInputs({ amounts, decimals, supply, isDeposit: false })
  skipWhen(mode !== 'balanced', () => {
    test('root', 'Missing balanced withdrawal amounts', () => {
      enforce(isComplete(amounts)).isTruthy()
    })
  })
  skipWhen(mode === 'balanced', () => validateMaxAmounts({ amounts, maxAmounts }))
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
  skipWhen(maximumBurn == null, () => {
    test('root', 'Maximum LP required exceeds the available LP balance. Reduce the token amounts.', () => {
      enforce(maybes([maximumBurn, lpAmount], (burn, budget) => new BigNumber(burn).lte(budget))).isTruthy()
    })
  })
  skipWhen(!isExactBurn, () => {
    test('maximumBurn', 'LP burn does not match the selected LP amount', () => {
      enforce(
        maybes([maximumBurn, lpAmount], (burn, amount) => decimalEqual(burn, decimalRound(amount, LP_TOKEN_DECIMALS))),
      ).isTruthy()
    })
  })
}

const validateOneCoinSelection = ({ mode, tokenIndex, amounts, lpAmount, maxLpAmount }: WithdrawSimulationParams) => {
  skipWhen(mode !== 'one-coin', () => {
    test('root', 'Max withdrawal requires the full LP balance and a single token output', () => {
      enforce(
        maybes(
          [tokenIndex, amounts],
          (index, amounts) => Number.isInteger(index) && index >= 0 && index < amounts.length,
        ),
      ).isTruthy()
      enforce(maybes([lpAmount, maxLpAmount], decimalEqual)).isTruthy()
      enforce(
        amounts?.every((amount, index) =>
          index === tokenIndex ? +(amount || '0') > 0 : decimalEqual(amount || '0', '0'),
        ),
      ).isTruthy()
    })
  })
}

/** Keep the editable form and the submitted transaction on the same amount and budget checks. */
const validateWithdrawAmounts = (params: WithdrawSimulationParams) => {
  const { lpAmount, maxLpAmount, supply, seedLock, maximumBurn, mode } = params
  validateSlippage({ slippage: params.slippage })
  validateOutputs(params)
  validateOneCoinSelection(params)
  const isExactBurn = mode !== 'unbalanced'
  validateBudget({ lpAmount: isExactBurn ? lpAmount : maximumBurn, maxLpAmount, supply, seedLock })
  validateMaximumBurn({ lpAmount: isExactBurn ? lpAmount : maxLpAmount, maximumBurn, isExactBurn })
  return isExactBurn
}

export const advancedWithdrawFormValidationSuite = createValidationSuite((values: AdvancedWithdrawFormValues) =>
  validateWithdrawAmounts(getAdvancedWithdrawParams(values)),
)

export const oneCoinWithdrawFormValidationSuite = createValidationSuite((values: OneCoinWithdrawFormValues) => {
  const { amount, maxAmount, isMax, maxLpAmount, maximumBurn, supply, seedLock, slippage } = values
  validateSlippage({ slippage })
  validateAmount('amount', amount, true)
  test('amount', 'Enter an amount to withdraw', () => {
    enforce(amount).isDecimal().gt(0)
  })
  test('maxAmount', 'Maximum withdrawal is unavailable', () => {
    enforce(maxAmount).isDecimal().gte(0)
  })
  test('amount', 'Amount exceeds the maximum withdrawal', () => {
    enforce(maybes([amount, maxAmount], (amount, maxAmount) => new BigNumber(amount).lte(maxAmount))).isTruthy()
  })
  validateBudget({ lpAmount: isMax ? maxLpAmount : maximumBurn, maxLpAmount, supply, seedLock })
  validateMaximumBurn({ lpAmount: maxLpAmount, maximumBurn, isExactBurn: isMax })
  validateOneCoinSelection(getOneCoinWithdrawParams(values))
})

const validateWithdraw = (params: WithdrawSimulationQuery) => {
  const { lpAmount, expected, slippage, maximumBurn } = params
  validatePool(params)
  validateAccount(params.account)
  const isExactBurn = validateWithdrawAmounts(params)
  test('expected', 'Withdrawal is too small to burn LP', () => {
    enforce(expected).isDecimal().gt(0)
  })
  skipWhen(!isExactBurn, () => {
    test('expected', 'LP quote does not match the selected LP amount', () => {
      enforce(decimalEqual(expected, decimalRound(lpAmount!, LP_TOKEN_DECIMALS))).isTruthy()
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
