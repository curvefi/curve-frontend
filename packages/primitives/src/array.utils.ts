export const sortBy = <T>(items: T[], getKey: (item: T) => number, order: 'asc' | 'desc' = 'asc'): T[] =>
  [...items].sort((a, b) => {
    const direction = order === 'asc' ? 1 : -1
    return (getKey(a) - getKey(b)) * direction
  })

/**
 * Computes a cutoff value that guarantees at least `minCount` items pass.
 *
 * Behavior:
 * - If at least `minCount` items have value ≥ `threshold`, returns `threshold` unchanged.
 * - Otherwise, returns the `minCount`-th largest value (the fallback cutoff so that ≥ `minCount` items pass).
 *   If fewer than `minCount` items exist, returns the smallest value.
 *
 * This is useful to build a filter that prefers a fixed threshold, while
 * still ensuring a minimum number of items are shown when the data is sparse.
 *
 * @template T - The type of items in the array.
 * @param items - The array of items to inspect.
 * @param getValue - Getter that maps an item to a numeric value.
 * @param threshold - Preferred minimum value for passing items.
 * @param minCount - Minimum number of items that must pass.
 * @returns The cutoff value to use for filtering.
 */
export function minCutoffForTopK<T>(
  items: T[],
  getValue: (item: T) => number,
  threshold: number,
  minCount: number,
): number {
  const valuesDesc = sortBy(items, getValue, 'desc').map(getValue)
  const firstBelowIdx = valuesDesc.findIndex((v) => v < threshold)
  if (firstBelowIdx === -1 || firstBelowIdx >= minCount) return threshold
  const count = minCount >= valuesDesc.length ? valuesDesc.length : minCount
  return valuesDesc[count - 1]
}

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
