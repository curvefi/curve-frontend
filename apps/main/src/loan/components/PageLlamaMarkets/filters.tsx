import type { FilterFn, FilterFnOption, Row } from '@tanstack/react-table'
import type { Assets, LlamaMarket } from '../../entities/llama-markets'

export const multiFilterFn: FilterFnOption<LlamaMarket> = (row, columnId, filterValue) =>
  !filterValue?.length || filterValue.includes(row.getValue(columnId))
export const boolFilterFn: FilterFnOption<LlamaMarket> = (row, columnId, filterValue) =>
  filterValue === undefined || Boolean(row.getValue(columnId)) === Boolean(filterValue)
export const listFilterFn: FilterFnOption<LlamaMarket> = (row, columnId, filterValue) =>
  filterValue === undefined || row.getValue<unknown[]>(columnId).length > 0 === Boolean(filterValue)

const matches = (value: string, filterValue: string) => value.toLowerCase().includes(filterValue)

export const filterByText: FilterFn<LlamaMarket> = (row: Row<LlamaMarket>, columnId: string, filterValue: string) => {
  const { borrowed, collateral } = row.getValue<Assets>(columnId)
  const filters = filterValue.toLowerCase().split(/\s+/)
  const { controllerAddress, address } = row.original
  return filters.every(
    (filter) =>
      [address, controllerAddress].some((value) => matches(value, filter)) ||
      [borrowed, collateral].some((a) => [a.symbol, a.address].some((value) => matches(value, filter))),
  )
}
