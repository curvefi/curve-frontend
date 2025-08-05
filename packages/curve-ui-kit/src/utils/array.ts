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
