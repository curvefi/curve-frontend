import type { Range } from '@ui-kit/types/util'
import { normalizeRangeFilterDefaults, type RangeFilterDefaults, serializeRangeFilter } from './filters'

export type UrlRange<T extends string | number> = Range<T | null>
export type NumberUrlRange = UrlRange<number>
export type DateUrlRange = UrlRange<string>
export type ParsedUrlRange<T extends string | number> = { range: UrlRange<T>; shouldCleanUrl: boolean }

const RANGE_SEPARATOR = '~'
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const DAY_IN_SECONDS = 24 * 60 * 60

export const emptyUrlRange = <T extends string | number>(): UrlRange<T> => [null, null]
const emptyParsedUrlRange = <T extends string | number>(shouldCleanUrl = false): ParsedUrlRange<T> => ({
  range: emptyUrlRange(),
  shouldCleanUrl,
})
const invalidUrlRange = <T extends string | number>() => emptyParsedUrlRange<T>(true)
const parsedUrlRange = <T extends string | number>(range: UrlRange<T>, originalValue: string): ParsedUrlRange<T> => ({
  range,
  shouldCleanUrl: serializeRangeFilter(range) !== originalValue,
})

export const isActiveUrlRange = (range: readonly unknown[]) => range.some(value => value != null && value !== '')

// URL params are bookmarkable and manually editable, so API-backed tables parse them stricter than form input.
const splitUrlRange = (value: string): [string, string] | null => {
  const parts = value.split(RANGE_SEPARATOR)
  return parts.length === 2 ? [parts[0], parts[1]] : null
}

const isReversedRange = <T extends string | number>([min, max]: UrlRange<T>) => min != null && max != null && min > max

const parseNumberBound = (value: string): number | null | undefined => {
  const trimmed = value.trim()
  if (!trimmed) return null

  const number = Number(trimmed)
  return Number.isFinite(number) ? number : undefined
}

export const parseNumberUrlRange = (
  value: string | null,
  defaults: RangeFilterDefaults<number> = emptyUrlRange(),
): ParsedUrlRange<number> => {
  if (value == null) return emptyParsedUrlRange()

  const parts = splitUrlRange(value)
  if (!parts) return invalidUrlRange()

  const min = parseNumberBound(parts[0])
  const max = parseNumberBound(parts[1])
  if (min === undefined || max === undefined) return invalidUrlRange()

  const range: NumberUrlRange = [min, max]
  if (isReversedRange(range)) return invalidUrlRange()

  return parsedUrlRange(normalizeRangeFilterDefaults(range, defaults), value)
}

type UtcDateParts = { day: number; month: number; year: number }

const getValidUtcDateParts = (value: string | null): UtcDateParts | null => {
  const match = value?.match(DATE_PATTERN)
  if (!match) return null

  const [, yearValue, monthValue, dayValue] = match
  const year = Number(yearValue)
  const month = Number(monthValue)
  const day = Number(dayValue)
  const date = new Date(Date.UTC(year, month - 1, day))

  // Validate the UTC calendar day instead of relying on browser parsing, which can vary by locale/timezone.
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? { day, month, year }
    : null
}

const parseDateBound = (value: string): string | null | undefined => {
  if (!value) return null

  return getValidUtcDateParts(value) ? value : undefined
}

export const parseDateUrlRange = (value: string | null): ParsedUrlRange<string> => {
  if (value == null) return emptyParsedUrlRange()

  const parts = splitUrlRange(value)
  if (!parts) return invalidUrlRange()

  const min = parseDateBound(parts[0])
  const max = parseDateBound(parts[1])
  if (min === undefined || max === undefined) return invalidUrlRange()

  const range: DateUrlRange = [min, max]
  if (isReversedRange(range)) return invalidUrlRange()

  return parsedUrlRange(range, value)
}

export const sortDateUrlRange = (range: DateUrlRange): DateUrlRange =>
  range[0] && range[1] && range[0] > range[1] ? [range[1], range[0]] : range

const dateToUtcUnixSeconds = (date: string | null, endOfDay = false) => {
  const dateParts = getValidUtcDateParts(date)
  if (!dateParts) return undefined

  const { day, month, year } = dateParts
  return Date.UTC(year, month - 1, day) / 1000 + (endOfDay ? DAY_IN_SECONDS - 1 : 0)
}

export const dateRangeToUtcUnixSeconds = ([min, max]: DateUrlRange) => ({
  min: dateToUtcUnixSeconds(min),
  max: dateToUtcUnixSeconds(max, true),
})
