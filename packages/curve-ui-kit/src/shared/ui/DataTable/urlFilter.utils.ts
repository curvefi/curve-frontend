import type { Range } from '@ui-kit/types/util'
import { normalizeRangeFilterDefaults, type RangeFilterDefaults, serializeRangeFilter } from './filters'

export type UrlRange<T extends string | number> = Range<T | null>
export type NumberUrlRange = UrlRange<number>
export type ParsedUrlRange<T extends string | number> = { range: UrlRange<T>; shouldCleanUrl: boolean }

const RANGE_SEPARATOR = '~'

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
