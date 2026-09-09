import type { Decimal } from '@primitives/decimal.utils'
import type { QueryWithData } from '@ui/features/queries/combine'
import { decimalCompare } from '@ui/lib/decimal'

/** Picks the successful max-receive query with the highest max debt. */
export const pickMaxDebtQuery = <TData extends { maxDebt: Decimal }>([first, ...rest]: readonly [
  QueryWithData<TData>,
  ...QueryWithData<TData>[],
]) => rest.reduce((max, item) => (decimalCompare(item.data.maxDebt, max.data.maxDebt) > 0 ? item : max), first)
