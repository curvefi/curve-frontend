import Fuse from 'fuse.js'
import { get } from 'lodash'
import { useMemo } from 'react'
import type { FilterFn, Row } from '@tanstack/react-table'

/** Replace ₮ with T so users don't need the special character to find Tether markets */
const cleanValue = <T>(value: T): T =>
  (Array.isArray(value) ? value.map(cleanValue) : typeof value === 'string' ? value.replace(/₮/g, 'T') : value) as T

/** Split input into text terms and (partial) address terms */
const splitSearchTerms = (input: string) =>
  input
    .trim()
    .split(/[, ]+/)
    .filter(Boolean)
    .reduce<{ text: string[]; addresses: string[] }>(
      (acc, term) => {
        acc[/^0x/i.test(term) ? 'addresses' : 'text'].push(term)
        return acc
      },
      { text: [], addresses: [] },
    )

function useFuseResultSet<T>(data: readonly T[], filterValue: string, textKeys: string[], addressKeys: string[]) {
  const textFuse = useMemo(
    () =>
      new Fuse(data, {
        ignoreLocation: true,
        ignoreDiacritics: true,
        isCaseSensitive: false,
        minMatchCharLength: 2,
        threshold: 0.01,
        getFn: (obj, path) => cleanValue(get(obj, path)),
        keys: textKeys,
      }),
    [data, textKeys],
  )

  const addressFuse = useMemo(
    () =>
      new Fuse(data, {
        ignoreLocation: true,
        isCaseSensitive: false,
        minMatchCharLength: 4,
        threshold: 0.01,
        keys: addressKeys,
      }),
    [data, addressKeys],
  )

  return useMemo(() => {
    if (!filterValue) return null

    const { text, addresses } = splitSearchTerms(filterValue)
    const matched = new Set<T>()

    if (text.length > 0) {
      const [first, ...rest] = text
      const items = rest.reduce(
        (results, term) => {
          const hits = new Set(textFuse.search(term).map((r) => r.item))
          return results.filter((item) => hits.has(item))
        },
        textFuse.search(first).map((r) => r.item),
      )
      items.forEach((item) => matched.add(item))
    }

    addresses.flatMap((addr) => addressFuse.search(addr)).forEach((r) => matched.add(r.item))

    return matched
  }, [textFuse, addressFuse, filterValue])
}

/**
 * Returns a stable `FilterFn<T>` backed by Fuse.js for use with TanStack Table's `globalFilterFn`.
 *
 * - Fuse indices are rebuilt only when `data` changes by reference.
 * - The result set is recomputed when `data` or `filterValue` changes.
 * - The returned `FilterFn` is a trivial `Set.has()` lookup per row.
 * - Text terms use AND semantics (all terms must match).
 * - Address terms use OR semantics (any address match is enough).
 */
export function useFuzzyFilterFn<T>(
  data: readonly T[],
  filterValue: string,
  textKeys: string[],
  addressKeys: string[],
): FilterFn<T> {
  const resultSet = useFuseResultSet(data, filterValue, textKeys, addressKeys)
  return useMemo(() => (row: Row<T>) => !resultSet || resultSet.has(row.original), [resultSet])
}

/**
 * Returns a filtered copy of `data` using Fuse.js fuzzy search.
 * Use this outside of TanStack Table (e.g. token selectors, dropdowns).
 *
 * - Returns the original `data` array when `filterValue` is empty.
 * - Preserves original array order (items are filtered, not re-sorted).
 */
export function useFuzzySearch<T>(data: readonly T[], filterValue: string, textKeys: string[], addressKeys: string[]) {
  const resultSet = useFuseResultSet(data, filterValue, textKeys, addressKeys)
  return useMemo(() => (resultSet ? data.filter((item) => resultSet.has(item)) : data), [data, resultSet])
}
