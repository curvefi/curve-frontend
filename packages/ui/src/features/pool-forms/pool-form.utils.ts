import type { Decimal } from '@primitives/decimal.utils'
import { maybe, range } from '@primitives/objects.utils'

export type PoolAmountField = `amount_${number}`
export type PoolMaxAmountField = `maxAmount_${number}`
export type PoolTokenField = PoolAmountField | PoolMaxAmountField

/**
 * Keep per-token form fields flat: we do not want to extend useForm to support nested values and errors before migrating
 * to TanStack Form. Convert to arrays only at validation, quote, and submission boundaries, using the pool's token order.
 */
export type PoolTokensForm = Record<PoolAmountField | PoolMaxAmountField, Decimal | undefined>

export const poolAmountField = (index: number): PoolAmountField => `amount_${index}`
export const poolMaxAmountField = (index: number): PoolMaxAmountField => `maxAmount_${index}`
export const poolTokenFields = (index: number) => [poolAmountField(index), poolMaxAmountField(index)] as const

/** Keep contract amounts in pool token order, regardless of form field insertion order. */
export const getPoolAmounts = (values: PoolTokensForm, tokenCount: number | undefined) =>
  maybe(tokenCount, count => range(count).map(index => values[poolAmountField(index)]))

export const getPoolDefaultValues = (tokenCount: number): Pick<PoolTokensForm, PoolAmountField> =>
  Object.fromEntries(range(tokenCount).map(index => [poolAmountField(index), undefined]))
