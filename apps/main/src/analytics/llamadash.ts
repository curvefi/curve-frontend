/*
 * This helper library aims to replace Lodash's chain function,
 * allowing us to avoid bundling the entire library when we only use about 1% of it.
 * These are *really* helpful when massaging data for the analytics dashboards.
 *
 * I explored lodash-es, but it doesn't support chain and caused module issues.
 * Radashi is also lacking in functionality we need; no size seems to fit all.
 *
 * Reference:
 * https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore?tab=readme-ov-file#_sortby-and-_orderby
 */

/**
 * Represents a grouped object with key-value pairs.
 * The reason this exists is because we want to chain
 * the .entries() method after an Array's .groupBy(),
 * and adding a prototype function to Object is annoying.
 *
 * @template K The type of the keys (must extend PropertyKey).
 * @template T The type of the values in the arrays.
 */
class LlamaObject<K extends PropertyKey, T> {
  constructor(public value: Partial<Record<K, T[]>>) {}

  entries() {
    return llama(Object.entries(this.value) as [string, T[]][])
  }
}

class LlamaArray<T> {
  constructor(private readonly _value: T[]) {}

  /** The inner array value. */
  value(): T[] {
    return this._value
  }

  /**
   * Returns a new array with the first n elements.
   * @param n The number of elements to take.
   * @returns A new array containing the first n elements.
   * @example [1, 2, 3, 4, 5].take(3) // [1, 2, 3]
   */
  take(n: number): LlamaArray<T> {
    return new LlamaArray(this._value.slice(0, n))
  }

  /**
   * Returns a new array with the last n elements.
   * @param n The number of elements to take from the end.
   * @returns A new array containing the last n elements.
   * @example [1, 2, 3, 4, 5].takeRight(3) // [3, 4, 5]
   */
  takeRight(n: number): LlamaArray<T> {
    return new LlamaArray(this._value.slice(-n))
  }

  /**
   * Creates a slice of array with n elements dropped from the beginning.
   * @param n The number of elements to drop (default: 1).
   * @returns A new array with the dropped elements.
   * @example [1, 2, 3].drop(2) // [3]
   */
  drop(n: number = 1): LlamaArray<T> {
    return new LlamaArray(this._value.slice(Math.max(0, n)))
  }

  /**
   * Creates a slice of array excluding elements dropped from the beginning until predicate returns falsey.
   * @param predicate The function invoked per iteration.
   * @returns The slice of the array.
   * @example [1, 2, 3, 4].dropWhile(n => n < 3) // [3, 4]
   */
  dropWhile(predicate: (value: T, index: number, array: T[]) => boolean): LlamaArray<T> {
    const index = this._value.findIndex((value, index, array) => !predicate(value, index, array))
    return new LlamaArray(index === -1 ? [] : this._value.slice(index))
  }

  /**
   * Combines elements from multiple arrays.
   * @param arrays Arrays to zip with the current array.
   * @returns An array of tuples containing elements from each input array.
   * @example [1, 2].zip(['a', 'b']) // [[1, 'a'], [2, 'b']]
   */
  zip<U>(...arrays: U[][]): LlamaArray<[T, ...U[]]> {
    return new LlamaArray(this._value.map((item, index) => [item, ...arrays.map((arr) => arr[index])]))
  }

  /**
   * Returns a new array with unique elements.
   * @returns A new array with unique elements.
   * @example [1, 2, 2, 3, 1].uniq() // [1, 2, 3]
   */
  uniq(): LlamaArray<T> {
    return new LlamaArray([...new Set(this._value)])
  }

  /**
   * Returns a new array with unique elements based on a comparator function.
   * @param comparator A function that compares two elements.
   * @returns A new array with unique elements.
   * @example [{id: 1}, {id: 2}, {id: 1}].uniqWith((a, b) => a.id === b.id) // [{id: 1}, {id: 2}]
   */
  uniqWith(comparator: (a: T, b: T) => boolean): LlamaArray<T> {
    return new LlamaArray(
      this._value.filter((element, index) => this._value.findIndex((step) => comparator(element, step)) === index),
    )
  }

  /**
   * Sorts the array based on the iteratee function and order.
   * @param iteratee A function that returns a comparable value for each item.
   * @param order The sort order, either "asc" or "desc".
   * @returns A new sorted array.
   * @example [{name: 'John', age: 30}, {name: 'Jane', age: 25}].orderBy(x => x.age, 'asc') // [{name: 'Jane', age: 25}, {name: 'John', age: 30}]
   */
  orderBy(
    iteratees: ((item: T) => string | number) | Array<(item: T) => string | number>,
    orders: 'asc' | 'desc' | Array<'asc' | 'desc'> = 'asc',
  ): LlamaArray<T> {
    const iterateesArray = Array.isArray(iteratees) ? iteratees : [iteratees]
    const ordersArray = Array.isArray(orders) ? orders : [orders]

    return new LlamaArray(
      [...this._value].sort((a, b) => {
        for (let i = 0; i < iterateesArray.length; i++) {
          const iteratee = iterateesArray[i]
          const order = Array.isArray(orders) ? ordersArray[i] || 'asc' : orders
          const aValue = iteratee(a)
          const bValue = iteratee(b)

          if (aValue !== bValue) {
            return (aValue > bValue ? 1 : -1) * (order === 'asc' ? 1 : -1)
          }
        }
        return 0
      }),
    )
  }

  /**
   * Groups the array elements by a key function.
   * @param keyFn A function that returns the grouping key for each item.
   * @returns A LlamaObject containing the grouped elements.
   * @example [{type: 'fruit', name: 'apple'}, {type: 'vegetable', name: 'carrot'}].groupBy(x => x.type) // LlamaObject { fruit: [{type: 'fruit', name: 'apple'}], vegetable: [{type: 'vegetable', name: 'carrot'}] }
   */
  groupBy<K extends PropertyKey>(keyFn: (item: T) => K): LlamaObject<K, T> {
    return new LlamaObject(Object.groupBy(this._value, keyFn))
  }

  /**
   * Computes the sum of the array using the iteratee function.
   * @param iteratee A function that returns a number for each item.
   * @returns The sum of the array.
   */
  sumBy(iteratee: (item: T) => number): number {
    return this._value.reduce((sum, item) => sum + iteratee(item), 0)
  }

  /**
   * Computes the mean of the array using the iteratee function.
   * @param iteratee A function that returns a number for each item.
   * @returns The mean of the array.
   */
  meanBy(iteratee: (item: T) => number): number {
    return this._value.length > 0 ? this.sumBy(iteratee) / this._value.length : 0
  }

  /**
   * Returns the element with the maximum value from the iteratee.
   * @param iteratee A function that returns a comparable value for each item.
   * @returns The element with the maximum value.
   */
  maxBy(iteratee: (item: T) => number): T | undefined {
    return this._value.reduce((max, current) => (iteratee(current) > iteratee(max) ? current : max))
  }

  /**
   * Creates an array of unique values that are included in the first array but not in the other arrays.
   * @param arrays The arrays to inspect for values to exclude.
   * @returns A new array of filtered values.
   * @example [2, 1].difference([2, 3]) // [1]
   */
  difference(...arrays: T[][]): LlamaArray<T> {
    const otherSet = new Set(arrays.flat())
    return new LlamaArray(this._value.filter((x) => !otherSet.has(x)))
  }

  // Passthrough methods to avoid needing to call .value() constantly
  map<U>(fn: (item: T, index: number, array: T[]) => U): LlamaArray<U> {
    return new LlamaArray(this._value.map(fn))
  }

  flatMap<U>(fn: (item: T, index: number, array: T[]) => U | U[]): LlamaArray<U> {
    return new LlamaArray(this._value.flatMap(fn))
  }

  filter(fn: (item: T, index: number, array: T[]) => boolean): LlamaArray<T> {
    return new LlamaArray(this._value.filter(fn))
  }
}

/** Wraps an array in a LlamaArray for chainable, non-polluting utility methods. */
export const llama = <T>(arr: T[]): LlamaArray<T> => new LlamaArray(arr)
