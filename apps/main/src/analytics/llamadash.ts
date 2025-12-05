/*
 * This helper library aims to replace Lodash's chain function,
 * allowing us to avoid bundling the entire library when we only use about 1% of it.
 *
 * I explored lodash-es, but it doesn't support chain and caused module issues.
 *
 * Reference:
 * https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore?tab=readme-ov-file#_sortby-and-_orderby
 */

import type { UTCTimestamp } from "lightweight-charts";

/**
 * Represents a grouped object with key-value pairs.
 * The reason this exists is because we want to chain
 * the .entries() method after an Array's .groupBy(),
 * and adding a prototype function to Object is bad.
 *
 * @template K The type of the keys (must extend PropertyKey).
 * @template T The type of the values in the arrays.
 */
class LlamaObject<K extends PropertyKey, T> {
  constructor(public value: Partial<Record<K, T[]>>) {}

  entries(): [string, T[]][] {
    return Object.entries(this.value) as [string, T[]][];
  }
}

declare global {
  interface Array<T> {
    /**
     * Returns a new array with the first n elements.
     * @param n The number of elements to take.
     * @returns A new array containing the first n elements.
     * @example [1, 2, 3, 4, 5].take(3) // [1, 2, 3]
     */
    take(n: number): T[];

    /**
     * Returns a new array with the last n elements.
     * @param n The number of elements to take from the end.
     * @returns A new array containing the last n elements.
     * @example [1, 2, 3, 4, 5].takeRight(3) // [3, 4, 5]
     */
    takeRight(n: number): T[];

    /**
     * Creates a slice of array with n elements dropped from the beginning.
     * @param n The number of elements to drop (default: 1).
     * @returns A new array with the dropped elements.
     * @example [1, 2, 3].drop(2) // [3]
     */
    drop(n?: number): T[];

    /**
     * Creates a slice of array excluding elements dropped from the beginning until predicate returns falsey.
     * @param predicate The function invoked per iteration.
     * @returns The slice of the array.
     * @example [1, 2, 3, 4].dropWhile(n => n < 3) // [3, 4]
     */
    dropWhile(predicate: (value: T, index: number, array: T[]) => boolean): T[];

    /**
     * Combines elements from multiple arrays.
     * @param arrays Arrays to zip with the current array.
     * @returns An array of tuples containing elements from each input array.
     * @example [1, 2].zip(['a', 'b']) // [[1, 'a'], [2, 'b']]
     */
    zip<U>(...arrays: U[][]): [T, ...U[]][];

    /**
     * Returns a new array with unique elements.
     * @returns A new array with unique elements.
     * @example [1, 2, 2, 3, 1].uniq() // [1, 2, 3]
     */
    uniq(): T[];

    /**
     * Returns a new array with unique elements based on a comparator function.
     * @param comparator A function that compares two elements.
     * @returns A new array with unique elements.
     * @example [{id: 1}, {id: 2}, {id: 1}].uniqWith((a, b) => a.id === b.id) // [{id: 1}, {id: 2}]
     */
    uniqWith(comparator: (a: T, b: T) => boolean): T[];

    /**
     * Sorts the array based on the iteratee function and order.
     * @param iteratee A function that returns a comparable value for each item.
     * @param order The sort order, either "asc" or "desc".
     * @returns A new sorted array.
     * @example [{name: 'John', age: 30}, {name: 'Jane', age: 25}].orderBy(x => x.age, 'asc') // [{name: 'Jane', age: 25}, {name: 'John', age: 30}]
     */
    orderBy(
      iteratees:
        | ((item: T) => string | number)
        | Array<(item: T) => string | number>,
      orders?: "asc" | "desc" | Array<"asc" | "desc">
    ): T[];

    /**
     * Groups the array elements by a key function.
     * @param keyFn A function that returns the grouping key for each item.
     * @returns A LlamaObject containing the grouped elements.
     * @example [{type: 'fruit', name: 'apple'}, {type: 'vegetable', name: 'carrot'}].groupBy(x => x.type) // LlamaObject { fruit: [{type: 'fruit', name: 'apple'}], vegetable: [{type: 'vegetable', name: 'carrot'}] }
     */
    groupBy<K extends PropertyKey>(keyFn: (item: T) => K): LlamaObject<K, T>;

    /**
     * Computes the sum of the array using the iteratee function.
     * @param iteratee A function that returns a number for each item.
     * @returns The sum of the array.
     */
    sumBy(iteratee: (item: T) => number): number;

    /**
     * Computes the mean of the array using the iteratee function.
     * @param iteratee A function that returns a number for each item.
     * @returns The mean of the array.
     */
    meanBy(iteratee: (item: T) => number): number;

    /**
     * Returns the element with the maximum value from the iteratee.
     * @param iteratee A function that returns a comparable value for each item.
     * @returns The element with the maximum value.
     */
    maxBy(iteratee: (item: T) => number): T | undefined;

    /**
     * Creates an array of unique values that are included in the first array but not in the other arrays.
     * @param arrays The arrays to inspect for values to exclude.
     * @returns A new array of filtered values.
     * @example [2, 1].difference([2, 3]) // [1]
     */
    difference(...arrays: T[][]): T[];
  }

  interface Date {
    getUTCTimestamp(): UTCTimestamp;
  }
}

Array.prototype.take = function <T>(this: T[], n: number) {
  return this.slice(0, n);
};

Array.prototype.takeRight = function <T>(this: T[], n: number) {
  return this.slice(-n);
};

Array.prototype.drop = function <T>(this: T[], n: number = 1) {
  return this.slice(Math.max(0, n));
};

Array.prototype.dropWhile = function <T>(
  this: T[],
  predicate: (value: T, index: number, array: T[]) => boolean
) {
  const index = this.findIndex(
    (value, index, array) => !predicate(value, index, array)
  );
  return index === -1 ? [] : this.slice(index);
};

Array.prototype.zip = function <T, U>(this: T[], ...arrays: U[][]) {
  return this.map((item, index) => [item, ...arrays.map((arr) => arr[index])]);
};

Array.prototype.uniq = function <T>(this: T[]) {
  return [...new Set(this)];
};

Array.prototype.uniqWith = function <T>(
  this: T[],
  comparator: (a: T, b: T) => boolean
) {
  return this.filter(
    (element, index) =>
      this.findIndex((step) => comparator(element, step)) === index
  );
};

Array.prototype.orderBy = function <T>(
  this: T[],
  iteratees:
    | ((item: T) => string | number)
    | Array<(item: T) => string | number>,
  orders: "asc" | "desc" | Array<"asc" | "desc"> = "asc"
) {
  const iterateesArray = Array.isArray(iteratees) ? iteratees : [iteratees];
  const ordersArray = Array.isArray(orders) ? orders : [orders];

  return [...this].sort((a, b) => {
    for (let i = 0; i < iterateesArray.length; i++) {
      const iteratee = iterateesArray[i];
      const order = Array.isArray(orders) ? ordersArray[i] || "asc" : orders;
      const aValue = iteratee(a);
      const bValue = iteratee(b);

      if (aValue !== bValue) {
        return (aValue > bValue ? 1 : -1) * (order === "asc" ? 1 : -1);
      }
    }

    return 0;
  });
};

Array.prototype.groupBy = function <T, K extends PropertyKey>(
  this: T[],
  keyFn: (item: T) => K
) {
  const grouped = Object.groupBy(this, keyFn);
  return new LlamaObject(grouped);
};

Array.prototype.sumBy = function <T>(this: T[], iteratee: (item: T) => number) {
  return this.reduce((sum, item) => sum + iteratee(item), 0);
};

Array.prototype.meanBy = function <T>(
  this: T[],
  iteratee: (item: T) => number
) {
  const sum = this.sumBy(iteratee);

  return this.length > 0 ? sum / this.length : 0;
};

Array.prototype.maxBy = function <T>(this: T[], iteratee: (item: T) => number) {
  return this.reduce((max, current) =>
    iteratee(current) > iteratee(max) ? current : max
  );
};

Array.prototype.difference = function <T>(this: T[], ...arrays: T[][]) {
  const otherSet = new Set(arrays.flat());
  return this.filter((x) => !otherSet.has(x));
};

Date.prototype.getUTCTimestamp = function () {
  return (this.getTime() / 1000) as UTCTimestamp;
};

export {};
