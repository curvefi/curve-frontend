import { each, skipWhen, test } from 'vest'
import { curveApiValidationGroup } from '@evm-ui/queries/validation/curve-api-validation'
import { evmAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import { poolValidationGroup } from '@evm-ui/queries/validation/pool-validation'
import {
  getPoolAmounts,
  LP_TOKEN_DECIMALS,
  poolAmountField,
  poolMaxAmountField,
} from '@ui/features/pool-forms/pool-form.utils'
import type { WithdrawFormValues } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { getSingleCoinWithdrawIndex } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { decimalEqual } from '@ui/lib/decimal'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { validateSlippage } from '@ui/lib/validation/slippage.validation'
import type { FieldsOf } from '@ui/lib/validation/types'
import type { UserWithdrawParams, WithdrawLpParams, WithdrawMaxParams, WithdrawParams } from './types'

const validateLpAmount = (lpAmount: WithdrawParams['lpAmount'], allowZero = false) =>
  test('lpAmount', 'Enter a valid LP amount', () => {
    enforce(lpAmount)
      .isDecimal({ decimal_digits: `0,${LP_TOKEN_DECIMALS}` })
      [allowZero ? 'gte' : 'gt'](0)
  })

const validateAmounts = ({
  amounts,
  decimals,
}: {
  amounts: WithdrawParams['amounts']
  decimals: WithdrawFormValues['decimals'] | null
}) => {
  test('root', 'Enter an amount to withdraw', () => {
    enforce(amounts?.some(amount => +(amount ?? '0') > 0)).equals(true)
  })
  test('decimals', 'Decimals are required', () => {
    enforce(decimals).isArray().isNotEmpty()
    enforce(decimals?.every(decimal => decimal != null && decimal >= 0)).equals(true)
  })
  test('root', 'Amounts must match pool token count', () => {
    enforce(amounts?.length).equals(decimals?.length)
  })
  each(amounts ?? [], (amount, index) => {
    test(poolAmountField(index), 'Enter a valid non-negative amount', () => {
      enforce(amount).isDecimal({ decimal_digits: '0,' }).gte(0)
    })
    skipWhen(decimals?.[index] == null, () => {
      test(poolAmountField(index), 'Amount exceeds token decimal precision', () => {
        enforce(amount).isDecimal({ decimal_digits: `0,${decimals![index]}` })
      })
    })
  })
}

const validateWithdraw = ({
  amounts,
  lpAmount,
  maxLpAmount,
  maxWithdrawIndex,
  isBalanced,
  isWrapped,
  slippage,
}: WithdrawParams) => {
  validateLpAmount(lpAmount)
  validateSlippage({ slippage })
  test('maxLpAmount', 'LP balance is unavailable', () => {
    enforce(maxLpAmount).isDecimal().gte(0)
  })
  test('lpAmount', 'Insufficient LP balance', () => {
    enforce(lpAmount).lte(maxLpAmount!)
  })
  test('isWrapped', () => {
    enforce(isWrapped).isBoolean()
  })
  test('isBalanced', () => {
    enforce(isBalanced).isBoolean()
  })
  skipWhen(maxWithdrawIndex == null, () => {
    test('root', 'Max withdrawal requires the full LP balance and a single token output', () => {
      enforce(isBalanced).isFalsy()
      enforce(maxWithdrawIndex)
        .isNumber()
        .condition(Number.isInteger)
        .gte(0)
        .lt(amounts?.length ?? 0)
      enforce(getSingleCoinWithdrawIndex({ maxWithdrawIndex, lpAmount, maxLpAmount })).equals(maxWithdrawIndex)
      enforce(
        amounts?.every((amount, i) => (i === maxWithdrawIndex ? +amount > 0 : decimalEqual(amount, '0'))),
      ).isTruthy()
    })
  })
}

const validateMaximumBurn = ({
  maximumBurn,
  lpAmount,
  maxLpAmount,
  maxWithdrawIndex,
  isBalanced,
}: FieldsOf<WithdrawFormValues>) => {
  test('maximumBurn', 'Withdrawal quote is unavailable', () => {
    enforce(maximumBurn)
      .isDecimal({ decimal_digits: `0,${LP_TOKEN_DECIMALS}` })
      .gt(0)
  })
  skipWhen(maximumBurn == null, () => {
    test(
      'root',
      'Maximum LP required exceeds the LP amount. Reduce the token amounts or increase the LP amount.',
      () => {
        enforce(maximumBurn).lte(lpAmount!)
      },
    )
  })
  skipWhen(!isBalanced && getSingleCoinWithdrawIndex({ maxWithdrawIndex, lpAmount, maxLpAmount }) == null, () => {
    test('maximumBurn', 'LP burn does not match the selected LP amount', () => {
      enforce(decimalEqual(maximumBurn!, lpAmount!)).isTruthy()
    })
  })
}

export const withdrawFormValidationSuite = createValidationSuite(
  ({ decimals, isBalanced, ...values }: WithdrawFormValues) => {
    const amounts = getPoolAmounts(values, decimals?.length)
    validateAmounts({ amounts, decimals })
    validateWithdraw({ ...values, amounts, isBalanced })
    validateMaximumBurn({ ...values, isBalanced })
    each(amounts ?? [], (amount, index) => {
      const maxAmount = values[poolMaxAmountField(index)]
      skipWhen(isBalanced || maxAmount == null, () => {
        test(poolAmountField(index), 'Amount exceeds the maximum withdrawal', () => {
          enforce(amount).lte(maxAmount!)
        })
      })
    })
  },
)

export const withdrawQueryValidationSuite = createValidationSuite(
  ({ chainId, poolAddress, amounts, decimals, ...params }: WithdrawParams) => {
    poolValidationGroup({ chainId, poolAddress })
    curveApiValidationGroup({ chainId }, { requireRpc: true })
    validateAmounts({ amounts, decimals })
    validateWithdraw({ ...params, amounts })
  },
)

export const userWithdrawParamsValidationSuite = createValidationSuite(
  ({ userAddress, ...params }: UserWithdrawParams) => {
    withdrawQueryValidationSuite.run(params)
    evmAddressValidationGroup({ evmAddress: userAddress })
  },
)

const validateLpQuery = ({ chainId, poolAddress, lpAmount, isWrapped }: WithdrawLpParams, allowZero = false) => {
  poolValidationGroup({ chainId, poolAddress })
  curveApiValidationGroup({ chainId }, { requireRpc: true })
  validateLpAmount(lpAmount, allowZero)
  test('isWrapped', () => {
    enforce(isWrapped).isBoolean()
  })
}

export const withdrawLpValidationSuite = createValidationSuite(validateLpQuery)

export const withdrawMaxValidationSuite = createValidationSuite(({ index, ...params }: WithdrawMaxParams) => {
  validateLpQuery(params, true)
  test('index', 'Invalid pool token index', () => {
    enforce(index).isNumber().condition(Number.isInteger).gte(0).lt(8)
  })
})
