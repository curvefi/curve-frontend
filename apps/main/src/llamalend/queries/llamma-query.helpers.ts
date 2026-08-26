import type { QueryWithData } from '@evm-ui/lib/queries/combine'
import { decimalCompare } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'

/** Picks the successful max-receive query with the highest max debt. */
export const pickMaxDebtQuery = <TData extends { maxDebt: Decimal }>([first, ...rest]: readonly [
  QueryWithData<TData>,
  ...QueryWithData<TData>[],
]) => rest.reduce((max, item) => (decimalCompare(item.data.maxDebt, max.data.maxDebt) > 0 ? item : max), first)
