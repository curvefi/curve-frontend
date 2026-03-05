/**
 * Sorts an array by a numeric key in ascending or descending order.
 * @param items Items to sort.
 * @param getKey Function that returns the numeric sort key for each item.
 * @param order Sort order (`asc` by default).
 * @returns A new sorted array.
 */
export const sortBy = <T>(items: T[], getKey: (item: T) => number, order: 'asc' | 'desc' = 'asc'): T[] =>
  items.toSorted((a, b) => {
    const direction = order === 'asc' ? 1 : -1
    return (getKey(a) - getKey(b)) * direction
  })

/** Split a list into two slices at the given index. */
export const splitAt = <T>(items: T[], index: number) => [items.slice(0, index), items.slice(index)]

/** Split a list into two slices at the first index where the predicate is true. */
export const splitAtFirst = <T>(items: T[], predicate: (value: T, index: number, obj: T[]) => unknown) => {
  const index = items.findIndex(predicate)
  return index === -1 ? [items, []] : splitAt(items, index)
}

/**
 * Ensures the input is always returned as an array.
 * - If the input is already an array, it is returned as-is.
 * - If the input is a single item (not an array), it is wrapped in an array.
 * - If the input is null or undefined, an empty array is returned.
 */
export const toArray = <T>(x: T | readonly T[] | null | undefined): readonly T[] =>
  Array.isArray(x) ? x : x == null ? [] : [x as T]
