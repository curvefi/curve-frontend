import type { FilterFn } from '@tanstack/react-table'
import { Range } from '@ui-kit/types/util'
import { formatNumber } from '@ui-kit/utils'
import type { Unit } from '@ui-kit/utils/units'

const RANGE_SEPARATOR = '~'
const LIST_SEPARATOR = ','

export type RangeFilterDefaults<T extends string | number> = Range<T | null | undefined>

export const normalizeRangeFilterDefaults = <T extends string | number>(
  range: Range<T | null>,
  defaults: RangeFilterDefaults<T>,
): Range<T | null> => range.map((value, index) => (value === defaults[index] ? null : value)) as Range<T | null>

export const serializeRangeFilter = <T extends string | number>(range: Range<T | null> | null) =>
  range?.some(v => v != null) ? range.join(RANGE_SEPARATOR) : null

export const parseRangeFilter = (serialized: string | undefined) =>
  serialized?.split(RANGE_SEPARATOR).map(v => (v && !isNaN(+v) ? +v : null)) as
    [number | null, number | null] | undefined

export const getRangeFilterLabel = (
  [min, max]: Range<number | null>,
  unit?: Unit,
  // APY can be negative, so it has no default lower bound; a selected `0` should still show as `>0%`.
  { defaultMin = 0 }: { defaultMin?: number | null } = {},
) => {
  const shouldShowMin = min != null && min !== defaultMin
  const formatValue = (value: number) => formatNumber(value, { abbreviate: true, ...(unit && { unit }) })

  if (!shouldShowMin && max != null) return `<${formatValue(max)}`
  if (shouldShowMin && max == null) return `>${formatValue(min)}`
  if (shouldShowMin && max != null) return `${formatValue(min)} - ${formatValue(max)}`

  return null
}

export const serializeListFilter = (list: string[] | null | undefined) => list?.join(LIST_SEPARATOR) || null

export const parseListFilter = (serialized: string | undefined) => serialized?.split(LIST_SEPARATOR).filter(v => v)

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
