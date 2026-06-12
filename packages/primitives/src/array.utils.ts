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

/**
 * Computes a moving average over a sorted numeric time-series using a sliding window.
 * Data must be sorted by timestamp ascending.
 */
export function movingAverage(values: number[], timestamps: number[], windowMs: number): number[] {
  let windowStart = 0
  let windowSum = 0

  return values.map((value, i) => {
    windowSum += value
    while (timestamps[windowStart] < timestamps[i] - windowMs) {
      windowSum -= values[windowStart]
      windowStart++
    }
    return windowSum / (i - windowStart + 1)
  })
}

/**
 * Returns the median value from an array of numbers or `undefined` when the array is empty.
 * For even-length arrays, this returns the lower-middle value.
 */
export const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? sorted[middle - 1] : sorted[middle]
}

export const zip = <T extends readonly unknown[][]>(
  ...arrays: T
): { [K in keyof T]: T[K] extends readonly (infer U)[] ? U : never }[] => {
  if (arrays.some(array => array.length !== arrays[0].length)) {
    throw new Error('Cannot zip arrays with different lengths')
  }
  return arrays[0].map((_, i) => arrays.map(array => array[i])) as {
    [K in keyof T]: T[K] extends readonly (infer U)[] ? U : never
  }[]
}
