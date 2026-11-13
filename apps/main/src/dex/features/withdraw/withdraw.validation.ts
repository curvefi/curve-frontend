import { each, skipWhen, test } from 'vest'
import { tryGetPool } from '@/dex/pool.utils'
import { curveApiValidationGroup } from '@evm-ui/queries/validation/curve-api-validation'
import { evmAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import { poolValidationGroup } from '@evm-ui/queries/validation/pool-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { range } from '@primitives/objects.utils'
import { LP_TOKEN_DECIMALS, poolAmountField, type PoolAmountField } from '@ui/features/pool-forms/pool-form.utils'
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

// single-coin form has one field named amount; advanced form uses amount_0, amount_1, etc.
type AmountField = (index: number) => PoolAmountField | 'amount'

const validateLpAmount = (
  lpAmount: WithdrawLpParams['lpAmount'],
  /** We allow zero when validating a user's LP balance, but withdrawing 0 LPs is not allowed **/
  { allowZero = false },
) =>
  test('lpAmount', 'Enter a valid LP amount', () => {
    enforce(lpAmount)
      .isDecimal({ decimal_digits: `0,${LP_TOKEN_DECIMALS}` })
      [allowZero ? 'gte' : 'gt'](0)
  })

const validateAmounts = ({ amounts, decimals }: WithdrawParams, field: AmountField = poolAmountField) => {
  test('root', 'Enter an amount to withdraw', () => {
    enforce(amounts)
      .isArray()
      .condition(() => amounts!.some(amount => amount && +amount))
  })
  test('decimals', 'Decimals are required', () => {
    enforce(decimals).isArray().isNotEmpty()
  })
  each(decimals ?? [], (decimal, index) =>
    test(field(index), 'Token decimals must be a non-negative number', () => {
      enforce(decimal).isNumber().gte(0)
    }),
  )
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

const validateWithdraw = (
  { amounts, maxLpAmount, slippage, ...params }: WithdrawParams,
  field: AmountField = poolAmountField,
) => {
  validateSlippage({ slippage })
  test('mode', 'Invalid withdrawal mode', () => {
    enforce(params.mode).inside(['balanced', 'unbalanced', 'one-coin'])
  })
  test('maxLpAmount', 'LP balance is unavailable', () => {
    enforce(maxLpAmount).isDecimal().gte(0)
  })
  skipWhen(params.mode !== 'balanced' && params.mode !== 'one-coin', () => {
    if (params.mode !== 'balanced' && params.mode !== 'one-coin') return // type safety inside skipWhen
    validateLpAmount(params.lpAmount, { allowZero: false })
    test('lpAmount', 'Insufficient LP balance', () => {
      enforce(params.lpAmount).lte(maxLpAmount!)
    })
  })
  skipWhen(params.mode !== 'one-coin', () => {
    if (params.mode !== 'one-coin') return // type safety inside skipWhen
    test('tokenIndex', 'Invalid pool token index', () => {
      enforce(params.tokenIndex)
        .isNumber()
        .inside(range(amounts?.length ?? 0))
    })
    test('lpAmount', 'Max withdrawal requires the full LP balance', () => {
      enforce(params.lpAmount).condition(() => decimalEqual(params.lpAmount!, maxLpAmount!))
    })
    each(amounts ?? [], (amount, index) => {
      skipWhen(index !== params.tokenIndex, () =>
        test(field(index), 'Enter an amount to withdraw', () => {
          enforce(amount).gt(0)
        }),
      )
      skipWhen(index === params.tokenIndex, () =>
        test(field(index), 'Only the selected token can have a withdrawal amount', () => {
          enforce(amount).condition(() => decimalEqual(amount!, '0'))
        }),
      )
    })
  })
}

type FormParams = WithdrawParams & { maximumBurn: Decimal | undefined; maxAmounts: (Decimal | undefined)[] | undefined }

const validateForm = (params: FormParams, field: AmountField = poolAmountField) => {
  const { maximumBurn, maxLpAmount, mode, amounts, maxAmounts } = params
  validateAmounts(params, field)
  validateWithdraw(params, field)
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
  skipWhen(params.mode !== 'balanced' && params.mode !== 'one-coin', () => {
    if (params.mode !== 'balanced' && params.mode !== 'one-coin') return // type safety inside skipWhen
    test('maximumBurn', 'LP burn does not match the selected LP amount', () => {
      enforce(maximumBurn).condition(() => decimalEqual(maximumBurn!, params.lpAmount!))
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
    const pool = tryGetPool(params.poolAddress)
    const tokens = params.isWrapped ? pool?.wrappedCoins : pool?.underlyingCoins
    enforce(index)
      .isNumber()
      .inside(range(tokens?.length ?? 0))
  })
})
