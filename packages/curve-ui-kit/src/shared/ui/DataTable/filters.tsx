import type { FilterFn } from '@tanstack/react-table'
import { Range } from '@ui-kit/types/util'

export const serializeRangeFilter = <T extends string | number>(range: Range<T | null> | null) =>
  range?.some((v) => v != null) ? range.join('~') : null

export const parseRangeFilter = (serialized: string | undefined) =>
  serialized?.split('~').map((v) => (v && !isNaN(+v) ? +v : null)) as [number | null, number | null] | undefined

export const serializeListFilter = (list: string[] | null | undefined) => list?.join(',') || null

export const parseListFilter = (serialized: string | undefined) => serialized?.split(',').filter((v) => v)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FilterFunction = FilterFn<any>

export const multiFilterFn: FilterFunction = (row, columnId, filterValue?: string) =>
  !filterValue?.length || !!parseListFilter(filterValue)?.includes(row.getValue(columnId))
export const boolFilterFn: FilterFunction = (row, columnId, filterValue?: string) =>
  !filterValue || Boolean(row.getValue<boolean>(columnId)) === Boolean(filterValue !== 'no')
export const listNotEmptyFilterFn: FilterFunction = (row, columnId, filterValue?: string) =>
  !filterValue || row.getValue<unknown[]>(columnId).length > 0 === Boolean(filterValue)
export const inListFilterFn: FilterFunction = (row, columnId, filterValue?: string) =>
  !filterValue || row.getValue<unknown[]>(columnId)?.includes(filterValue)
export const rangeFilterFn: FilterFunction = (row, columnId, filterValue?: string) => {
  const [min, max] = parseRangeFilter(filterValue) ?? []
  const value = row.getValue<number>(columnId)
  return (min == null || value >= min) && (max == null || value <= max)
}
