import { get } from 'lodash'
import type { FilterFn } from '@tanstack/react-table'
import { type DeepKeys } from '@tanstack/table-core'

export const multiFilterFn: FilterFn<any> = (row, columnId, filterValue?: string[]) =>
  !filterValue?.length || filterValue.includes(row.getValue(columnId))
export const boolFilterFn: FilterFn<any> = (row, columnId, filterValue?: boolean) =>
  filterValue === undefined || Boolean(row.getValue<boolean>(columnId)) === Boolean(filterValue)
export const listFilterFn: FilterFn<any> = (row, columnId, filterValue?: boolean) =>
  filterValue === undefined || row.getValue<unknown[]>(columnId).length > 0 === Boolean(filterValue)
export const inListFilterFn: FilterFn<any> = (row, columnId, filterValue?: unknown) =>
  filterValue == null || row.getValue<unknown[]>(columnId)?.includes(filterValue)

/**
 * Creates a filter function for the given search fields
 */
export const filterByText =
  <T,>(...fields: DeepKeys<T>[]): FilterFn<T> =>
  (row, _columnId, filter: string) =>
    filter
      .toLowerCase()
      .split(/\s+/)
      .every((filterWord) => fields.some((field) => get(row.original, field)?.toLowerCase?.().includes(filterWord)))
