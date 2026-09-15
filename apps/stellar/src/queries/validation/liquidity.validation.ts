import { each, test } from 'vest'
import { MAX_I128 } from '@/stellar/lib/amounts'
import type { PoolQuery } from '@/stellar/queries/root-keys'
import { validatePool } from '@/stellar/queries/validation/pool.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { MAX_SLIPPAGE, MIN_SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import { poolAmountField, poolMaxAmountField } from '@ui/features/pool-forms/pool-form.utils'
import type { DeepPartial } from '@ui/features/queries/util'
import { decimalEqual, decimalGreaterThan, fromWei } from '@ui/lib/decimal'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'

export type QuoteQuery = PoolQuery & { amounts: (Decimal | undefined)[]; decimals: number[]; supply: Decimal }
export type QuoteParams = FieldsOf<DeepPartial<QuoteQuery>>
export type ExpectedLpQuery = QuoteQuery & { isDeposit: boolean; maxAmounts?: (Decimal | undefined)[] }
export type ExpectedLpParams = FieldsOf<DeepPartial<ExpectedLpQuery>>

export const validateSlippage = (slippage: Decimal | undefined) => {
  test('slippage', 'Invalid slippage tolerance', () => {
    enforce(slippage).isDecimal().gte(MIN_SLIPPAGE).lte(MAX_SLIPPAGE)
  })
}

export const validateAmount = (field: string, amount: Decimal | undefined, precision: number | undefined) => {
  test(field, 'Enter a valid non-negative amount', () => {
    enforce(amount || '0')
      .isDecimal({ decimal_digits: '0,' })
      .gte(0)
  })
  maybe(precision, precision => {
    test(field, 'Amount exceeds token decimal precision', () => {
      enforce(amount || '0').isDecimal({ decimal_digits: `0,${precision}` })
    })
    test(field, 'Amount exceeds the maximum supported token amount', () => {
      enforce(!decimalGreaterThan(amount || '0', fromWei(MAX_I128, precision))).isTruthy()
    })
  })
}

export const validateLiquidityInputs = (
  { amounts, decimals, supply }: Pick<QuoteParams, 'amounts' | 'decimals' | 'supply'>,
  isDeposit: boolean,
) => {
  test('supply', 'Pool supply is unavailable', () => {
    enforce(supply).isDecimal().gte(0)
    if (!isDeposit) enforce(supply).gt(0)
  })
  test('root', 'Pool data is unavailable', () => {
    enforce(decimals?.length).isNumber().gte(2).lte(8).equals(amounts?.length)
    decimals?.forEach(precision => enforce(precision).isNumber())
  })
  each(amounts ?? [], (amount, index) => validateAmount(poolAmountField(index), amount, decimals?.[index]))
  test('root', isDeposit ? 'Enter an amount to deposit' : 'Enter an amount to withdraw', () => {
    enforce(amounts?.some(amount => decimalGreaterThan(amount ?? '0', '0'))).isTruthy()
  })
  if (isDeposit) {
    test('root', 'Seed deposits require a positive amount of every coin', () => {
      enforce(
        supply == null ||
          !decimalEqual(supply, '0') ||
          decimals?.every((_, index) => decimalGreaterThan(amounts?.[index] || '0', '0')),
      ).isTruthy()
    })
  }
}

export const validateReserveAmounts = ({ amounts, maxAmounts }: Pick<ExpectedLpParams, 'amounts' | 'maxAmounts'>) => {
  each(amounts ?? [], (amount, index) => {
    test(poolMaxAmountField(index), 'Pool reserve is unavailable', () => {
      enforce(maxAmounts?.[index]).isDecimal().gte(0)
    })
    test(poolAmountField(index), 'Amount must be less than the available pool reserve', () => {
      enforce(decimalGreaterThan(maxAmounts?.[index] ?? '0', amount || '0')).isTruthy()
    })
  })
}

export const quoteValidationSuite = createValidationSuite((params: ExpectedLpQuery) => {
  validatePool(params)
  validateLiquidityInputs(params, params.isDeposit)
  if (!params.isDeposit) validateReserveAmounts(params)
})
