import type { Decimal } from '@primitives/decimal.utils'
import { type Nullish, maybe, range } from '@primitives/objects.utils'
import type { FieldsOf } from '@ui/lib/validation/types'

export type PoolAmountField = `amount_${number}`
export type PoolMaxAmountField = `maxAmount_${number}`
export type PoolTokenField = PoolAmountField | PoolMaxAmountField

/**
 * Keep per-token form fields flat: we do not want to extend useForm to support nested values and errors before migrating
 * to TanStack Form. Convert to arrays only at validation, quote, and submission boundaries, using the pool's token order.
 */
export type PoolTokenFields = Record<PoolAmountField | PoolMaxAmountField, Decimal | undefined>

export type PoolForm = PoolTokenFields & { isBalanced: boolean; decimals: (number | undefined)[] | undefined }

/** Shared fields used by liquidity-deposit forms. */
export type PoolDepositForm = PoolForm & { isWrapped: boolean }

export const poolAmountField = (index: number): PoolAmountField => `amount_${index}`

export const poolMaxAmountField = (index: number): PoolMaxAmountField => `maxAmount_${index}`

const poolTokenFields = (index: number) => [poolAmountField(index), poolMaxAmountField(index)] as const
export const allTokenFields = <T extends number | Nullish>(count: T) =>
  maybe(count, c => range(c).flatMap(index => poolTokenFields(index)))

/** Keep contract amounts in pool token order, regardless of form field insertion order. */
export const getPoolAmounts = <Count extends number | Nullish>(values: FieldsOf<PoolTokenFields>, tokenCount: Count) =>
  maybe(tokenCount, count => range(count).map(index => values[poolAmountField(index)] ?? '0'))

export const getPoolDefaultValues = (tokenCount: number): Pick<PoolTokenFields, PoolAmountField> =>
  Object.fromEntries(range(tokenCount).map(index => [poolAmountField(index), undefined]))

export const getPoolMaxAmounts = (values: PoolTokenFields, tokenCount: number | undefined) =>
  maybe(tokenCount, count => range(count).map(index => values[poolMaxAmountField(index)]))

export const depositMethod = (isWrapped: boolean) =>
  (({ true: 'depositWrapped', false: 'deposit' }) as const)[`${isWrapped}`]
