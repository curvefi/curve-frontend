import type { FilterFn } from '@tanstack/react-table'
import type { Assets, LlamaMarket } from '../../entities/llama-markets'

export const multiFilterFn: FilterFn<LlamaMarket> = (row, columnId, filterValue?: string[]) =>
  !filterValue?.length || filterValue.includes(row.getValue(columnId))
export const boolFilterFn: FilterFn<LlamaMarket> = (row, columnId, filterValue?: boolean) =>
  filterValue === undefined || Boolean(row.getValue<boolean>(columnId)) === Boolean(filterValue)
export const listFilterFn: FilterFn<LlamaMarket> = (row, columnId, filterValue?: boolean) =>
  filterValue === undefined || row.getValue<unknown[]>(columnId).length > 0 === Boolean(filterValue)

const matches = (value: string, filterValue: string) => value.toLowerCase().includes(filterValue)

export const filterByText: FilterFn<LlamaMarket> = (row, columnId, filterValue: string) => {
  const { borrowed, collateral } = row.getValue<Assets>(columnId)
  const filters = filterValue.toLowerCase().split(/\s+/)
  const { controllerAddress, address } = row.original
  return filters.every(
    (filter) =>
      [address, controllerAddress].some((value) => matches(value, filter)) ||
      [borrowed, collateral].some((a) => [a.symbol, a.address].some((value) => matches(value, filter))),
  )
}
