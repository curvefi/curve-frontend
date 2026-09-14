import type { Decimal } from '@primitives/decimal.utils'
import { maybe, range } from '@primitives/objects.utils'

export type DepositAmountField = `amount_${number}`
export type DepositMaxAmountField = `maxAmount_${number}`
export type DepositField = DepositAmountField | DepositMaxAmountField
/**
 * Keep per-token form fields flat: we do not want to extend useForm to support nested values and errors before migrating
 * to TanStack Form. Convert to arrays only at validation, quote, and submission boundaries, using the pool's token order.
 */
export type DepositFormValues = Record<DepositField, Decimal | undefined>

export const depositAmountField = (index: number): DepositAmountField => `amount_${index}`
export const depositMaxAmountField = (index: number): DepositMaxAmountField => `maxAmount_${index}`

/** Keep contract amounts in pool token order, regardless of form field insertion order. */
export const getDepositAmounts = (values: DepositFormValues, tokenCount: number | undefined) =>
  maybe(tokenCount, count => range(count).map(index => values[depositAmountField(index)]))

export const getDepositDefaultValues = (tokenCount: number): Pick<DepositFormValues, DepositAmountField> =>
  Object.fromEntries(range(tokenCount).map(index => [depositAmountField(index), undefined]))
