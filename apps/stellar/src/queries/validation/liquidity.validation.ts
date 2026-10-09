import { each, skipWhen, test } from 'vest'
import type { PoolQuery } from '@/stellar/queries/query-types'
import { validatePool } from '@/stellar/queries/validation/pool.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, notFalsy, notFalsyArray, type Nullish } from '@primitives/objects.utils'
import { poolAmountField, poolMaxAmountField } from '@ui/features/pool-forms/pool-form.utils'
import type { DeepPartial } from '@ui/features/queries/util'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'

export type QuoteQuery = PoolQuery & { amounts: (Decimal | undefined)[]; decimals: number[]; supply: Decimal }
export type QuoteParams = FieldsOf<DeepPartial<QuoteQuery>>
export type ExpectedLpQuery = QuoteQuery & {
  isDeposit: boolean
  maxAmounts?: (Decimal | undefined)[]
  lpAmount?: Decimal
  maxLpAmount?: Decimal
  maxWithdrawIndex?: number
}
export type ExpectedLpParams = FieldsOf<DeepPartial<ExpectedLpQuery>>

export const validateAmount = (field: string, amount: Decimal | Nullish, required = false) => {
  test(field, 'Enter a valid non-negative amount', () => {
    enforce(required ? amount : amount || '0')
      .isDecimal({ decimal_digits: '0,' })
      .gte(0)
  })
}

export const validateLiquidityInputs = ({
  amounts,
  decimals,
  supply,
  isDeposit,
}: Pick<QuoteParams, 'amounts' | 'decimals' | 'supply'> & Pick<ExpectedLpParams, 'isDeposit'>) => {
  test('supply', 'Pool supply is unavailable', () => {
    enforce(supply).isDecimal().gte(0)
    if (!isDeposit) enforce(supply).gt(0)
  })
  test('root', 'Pool data is unavailable', () => {
    enforce(decimals?.length).isNumber().gte(2).lte(8).equals(amounts?.length)
    decimals?.forEach(precision => enforce(precision).isNumber())
  })
  each(notFalsyArray(amounts), (amount, index) => validateAmount(poolAmountField(index), amount))
  test('root', isDeposit ? 'Enter an amount to deposit' : 'Enter an amount to withdraw', () => {
    enforce(maybe(amounts, amounts => notFalsy(...amounts).filter(amount => +amount > 0).length)).gt(0)
  })
  skipWhen(!isDeposit || maybe(supply, supply => +supply) !== 0, () => {
    test('root', 'Seed deposits require a positive amount of every coin', () => {
      decimals?.forEach((_, index) => {
        enforce(maybe(amounts?.[index], amount => +amount)).gt(0)
      })
    })
  })
}

export const validateMaxAmounts = ({ amounts, maxAmounts }: Pick<ExpectedLpParams, 'amounts' | 'maxAmounts'>) => {
  each(notFalsyArray(amounts), (amount, index) => {
    test(poolMaxAmountField(index), 'Maximum withdrawal is unavailable', () => {
      enforce(maxAmounts?.[index]).isDecimal().gte(0)
    })
    test(poolAmountField(index), 'Amount exceeds the maximum withdrawal', () => {
      enforce(+(amount || '0')).lte(maybe(maxAmounts?.[index], amount => +amount)!)
    })
  })
}

export const quoteValidationSuite = createValidationSuite(
  ({ pool, network, isDeposit, amounts, decimals, supply, maxAmounts }: ExpectedLpQuery) => {
    validatePool({ pool, network })
    validateLiquidityInputs({ amounts, decimals, supply, isDeposit })
    skipWhen(isDeposit, () => validateMaxAmounts({ amounts, maxAmounts }))
  },
)
