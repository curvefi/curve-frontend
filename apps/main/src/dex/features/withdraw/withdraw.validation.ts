import { each, skipWhen, test } from 'vest'
import { curveApiValidationGroup } from '@evm-ui/queries/validation/curve-api-validation'
import { evmAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import { poolValidationGroup } from '@evm-ui/queries/validation/pool-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { LP_TOKEN_DECIMALS, poolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import {
  getAdvancedWithdrawParams,
  getOneCoinWithdrawParams,
  type AdvancedWithdrawFormValues,
  type OneCoinWithdrawFormValues,
} from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { decimalEqual } from '@ui/lib/decimal'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { validateSlippage } from '@ui/lib/validation/slippage.validation'
import type { UserWithdrawParams, WithdrawLpParams, WithdrawMaxParams, WithdrawParams } from './types'

const validateLpAmount = (lpAmount: WithdrawParams['lpAmount'], { allowZero = false } = {}) =>
  test('lpAmount', 'Enter a valid LP amount', () => {
    enforce(lpAmount)
      .isDecimal({ decimal_digits: `0,${LP_TOKEN_DECIMALS}` })
      [allowZero ? 'gte' : 'gt'](0)
  })

const validateAmounts = ({ amounts, decimals }: WithdrawParams, field: (index: number) => string = poolAmountField) => {
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
    test(field(index), 'Enter a valid non-negative amount', () => {
      enforce(amount).isDecimal({ decimal_digits: '0,' }).gte(0)
    })
    skipWhen(decimals?.[index] == null, () => {
      test(field(index), 'Amount exceeds token decimal precision', () => {
        enforce(amount).isDecimal({ decimal_digits: `0,${decimals![index]}` })
      })
    })
  })
}

const validateWithdraw = ({ amounts, lpAmount, maxLpAmount, tokenIndex, mode, slippage }: WithdrawParams) => {
  validateSlippage({ slippage })
  test('mode', 'Invalid withdrawal mode', () => {
    enforce(['balanced', 'unbalanced', 'one-coin'].includes(mode!)).isTruthy()
  })
  test('maxLpAmount', 'LP balance is unavailable', () => {
    enforce(maxLpAmount).isDecimal().gte(0)
  })
  skipWhen(mode === 'unbalanced', () => {
    validateLpAmount(lpAmount)
    test('lpAmount', 'Insufficient LP balance', () => {
      enforce(lpAmount).lte(maxLpAmount!)
    })
  })
  skipWhen(mode !== 'one-coin', () => {
    test('root', 'Max withdrawal requires the full LP balance and a single token output', () => {
      enforce(tokenIndex)
        .isNumber()
        .condition(Number.isInteger)
        .gte(0)
        .lt(amounts?.length ?? 0)
      enforce(decimalEqual(lpAmount!, maxLpAmount!)).isTruthy()
      enforce(
        amounts?.every((amount, i) => (i === tokenIndex ? +(amount ?? '0') > 0 : decimalEqual(amount ?? '0', '0'))),
      ).isTruthy()
    })
  })
}

type FormParams = WithdrawParams & { maximumBurn: Decimal | undefined; maxAmounts: (Decimal | undefined)[] | undefined }

const validateForm = (params: FormParams, field: (index: number) => string = poolAmountField) => {
  const { maximumBurn, lpAmount, maxLpAmount, mode, amounts, maxAmounts } = params
  validateAmounts(params, field)
  validateWithdraw(params)
  test('maximumBurn', 'Withdrawal quote is unavailable', () => {
    enforce(maximumBurn)
      .isDecimal({ decimal_digits: `0,${LP_TOKEN_DECIMALS}` })
      .gt(0)
  })
  skipWhen(maximumBurn == null, () => {
    test('root', 'Maximum LP required exceeds the available LP balance. Reduce the token amounts.', () => {
      enforce(maximumBurn).lte(maxLpAmount!)
    })
  })
  skipWhen(mode === 'unbalanced', () => {
    test('maximumBurn', 'LP burn does not match the selected LP amount', () => {
      enforce(decimalEqual(maximumBurn!, lpAmount!)).isTruthy()
    })
  })
  each(amounts ?? [], (amount, index) => {
    skipWhen(mode === 'balanced' || maxAmounts?.[index] == null, () => {
      test(field(index), 'Amount exceeds the maximum withdrawal', () => {
        enforce(amount).lte(maxAmounts![index]!)
      })
    })
  })
}

export const advancedWithdrawFormValidationSuite = createValidationSuite((values: AdvancedWithdrawFormValues) =>
  validateForm(getAdvancedWithdrawParams(values)),
)

export const oneCoinWithdrawFormValidationSuite = createValidationSuite((values: OneCoinWithdrawFormValues) => {
  validateForm(getOneCoinWithdrawParams(values), () => 'amount')
  test('amount', 'Enter an amount to withdraw', () => {
    enforce(values.amount).isDecimal().gt(0)
  })
})

export const withdrawQueryValidationSuite = createValidationSuite((params: WithdrawParams) => {
  poolValidationGroup(params)
  curveApiValidationGroup(params, { requireRpc: true })
  validateAmounts(params)
  validateWithdraw(params)
  test('isWrapped', () => {
    enforce(params.isWrapped).isBoolean()
  })
})

export const userWithdrawParamsValidationSuite = createValidationSuite(
  ({ userAddress, ...params }: UserWithdrawParams) => {
    withdrawQueryValidationSuite.run(params)
    evmAddressValidationGroup({ evmAddress: userAddress })
  },
)

const validateLpQuery = ({ chainId, poolAddress, lpAmount, isWrapped }: WithdrawLpParams) => {
  poolValidationGroup({ chainId, poolAddress })
  curveApiValidationGroup({ chainId }, { requireRpc: true })
  validateLpAmount(lpAmount, { allowZero: true })
  test('isWrapped', () => {
    enforce(isWrapped).isBoolean()
  })
}

export const withdrawMaxValidationSuite = createValidationSuite(({ index, ...params }: WithdrawMaxParams) => {
  validateLpQuery(params)
  test('index', 'Invalid pool token index', () => {
    enforce(index).isNumber().condition(Number.isInteger).gte(0).lt(8)
  })
})
