import lodash from 'lodash'

const { orderBy, takeWhile } = lodash

/**
 * Returns items sorted by a numeric value in descending order,
 * including all items with values above a threshold,
 * but always ensures at least `minCount` items are included from the top.
 *
 * Example use case would be to take pools with TVL above threshold,
 * but always include at least the top 10 by TVL.
 *
 * @template T - The type of items in the array.
 * @param items - The array of items to filter and sort.
 * @param getValue - A function that returns a numeric value for each item (used for sorting and threshold check).
 * @param threshold - The minimum value required for items to be included beyond the first `minCount`.
 * @param minCount - The minimum number of top items to always include, regardless of threshold.
 * @returns A new array of items matching the threshold or satisfying the minimum count requirement.
 */
export function takeTopWithMin<T>(items: T[], getValue: (item: T) => number, threshold: number, minCount: number): T[] {
  const sorted = orderBy(items, getValue, 'desc')
  return takeWhile(sorted, (_item, index) => getValue(sorted[index]) >= threshold || index < minCount)
}

/**
 * Computes a cutoff value that guarantees at least `minCount` items pass.
 * - This function is the numeric counterpart of `takeTopWithMin`.
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
  const valuesDesc = orderBy(items.map(getValue), undefined, 'desc')
  const firstBelowIdx = valuesDesc.findIndex((v) => v < threshold)
  if (firstBelowIdx === -1 || firstBelowIdx >= minCount) return threshold
  // we have fewer than minCount items above threshold, find the minCount-th value
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
