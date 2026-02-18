import Fuse from 'fuse.js'
import { get, partition } from 'lodash'
import { useMemo } from 'react'
import type { FilterFn, Row } from '@tanstack/react-table'

/** Replace ₮ with T so users don't need the special character to find Tether markets */
const cleanValue = <T>(value: T): T =>
  (Array.isArray(value) ? value.map(cleanValue) : typeof value === 'string' ? value.replace(/₮/g, 'T') : value) as T

/** Don't search for "0x" or "0xA", it's too broad */
const MIN_ADDRESS_LENGTH = 4

/**
 * Split a search input string into text terms and (partial) address terms.
 *
 * - Terms are split on whitespace or commas.
 * - A term starting with `0x` (case-insensitive) is classified as an address.
 * - Short address terms (fewer than {@link MIN_ADDRESS_LENGTH} characters) are discarded
 *   because they would match too broadly (e.g. every address starts with "0x").
 */
const splitSearchTerms = (input: string) => {
  const terms = input.trim().split(/[, ]+/).filter(Boolean)
  const [addresses, text] = partition(terms, (t) => /^0x/i.test(t) && t.length >= MIN_ADDRESS_LENGTH)
  return { text, addresses }
}

/**
 * Internal hook that builds a Fuse.js index over `data` and computes a `Set` of matching items
 * whenever `filterValue` changes.
 *
 * - The Fuse index is rebuilt only when `data` or `keys` change by reference.
 * - Text terms are intersected (AND): an item must match **all** text terms.
 * - Address terms are unioned (OR): an item matching **any** address term is included.
 * - Returns `null` when `filterValue` is empty (meaning "show everything").
 *
 * @param data        The dataset to index. Should be referentially stable (e.g. from `useMemo`).
 * @param filterValue The raw search string entered by the user.
 * @param keys        Dot-path keys to index (both text and address fields).
 * @returns A `Set` of matching items, or `null` if there is no active filter.
 */
function useFuseResultSet<T>(data: readonly T[], filterValue: string, keys: string[]) {
  const fuse = useMemo(
    () =>
      new Fuse(data, {
        ignoreLocation: true,
        ignoreDiacritics: true,
        isCaseSensitive: false,
        minMatchCharLength: 2,
        threshold: 0.01,
        getFn: (obj, path) => cleanValue(get(obj, path)),
        keys,
      }),
    [data, keys],
  )

  return useMemo(() => {
    if (!filterValue) return null

    const { text, addresses } = splitSearchTerms(filterValue)
    const matched = new Set<T>()

    if (text.length > 0) {
      const [first, ...rest] = text
      rest
        .reduce(
          (results, term) => {
            const hits = new Set(fuse.search(term).map((r) => r.item))
            return results.filter((item) => hits.has(item))
          },
          fuse.search(first).map((r) => r.item),
        )
        .forEach((item) => matched.add(item))
    }

    addresses.flatMap((addr) => fuse.search(addr)).forEach((r) => matched.add(r.item))

    return matched
  }, [fuse, filterValue])
}

/** Returns a stable {@link FilterFn} backed by Fuse.js, for use as TanStack Table's `globalFilterFn`. */
export function useFuzzyFilterFn<T>(data: readonly T[], filterValue: string, keys: string[]): FilterFn<T> {
  const resultSet = useFuseResultSet(data, filterValue, keys)
  return useMemo(() => (row: Row<T>) => !resultSet || resultSet.has(row.original), [resultSet])
}

/**
 * Returns a filtered copy of `data` using Fuse.js fuzzy search.
 * Use this outside of TanStack Table (e.g. token selectors, dropdowns).
 */
export function useFuzzySearch<T>(data: readonly T[], filterValue: string, keys: string[]) {
  const resultSet = useFuseResultSet(data, filterValue, keys)
  return useMemo(() => (resultSet ? data.filter((item) => resultSet.has(item)) : data), [data, resultSet])
}
