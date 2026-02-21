import lodash from 'lodash'

const { orderBy } = lodash

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
