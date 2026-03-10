export type Falsy = false | 0 | '' | null | undefined
export type PartialRecord<Key extends PropertyKey, Value> = Partial<Record<Key, Value>>

/** Object.keys with better type inference */
export const objectKeys = <T extends object>(values: T): (keyof T)[] => Object.keys(values) as (keyof T)[]

/** Object.values with better type inference for records */
export const recordValues = <K extends PropertyKey, T>(obj: Record<K, T> | PartialRecord<K, T>): T[] =>
  Object.values(obj) as T[]

/** Object.fromEntries with better type inference for records */
export const fromEntries = <K extends PropertyKey, V>(values: (readonly [K, V])[]): Record<K, V> =>
  Object.fromEntries(values) as Record<K, V>

/**
 * Receives and object and a function to convert each key-value pair into a new value (with the same key).
 * @param obj The object to map.
 * @param mapper The function to convert each key-value pair into a new value.
 * @return a new object with the same keys and converted values.
 */
export function mapRecord<K extends string, V, R>(obj: Record<K, V>, mapper: (key: K, value: V) => R): Record<K, R> {
  const entries = Object.entries(obj).map(([k, v]) => [k, mapper(k as K, v as V)])
  return Object.fromEntries(entries) as Record<K, R>
}

/** Object.entries with better type inference for records */
export const recordEntries = <K extends string, T>(obj: Record<K, T> | PartialRecord<K, T>): [K, T][] =>
  Object.entries(obj) as [K, T][]

export const notFalsy = <T>(...items: (T | Falsy)[]): T[] => items.filter(Boolean) as T[]

export function assert<T>(value: T | null | undefined | 0 | false | '', message: string) {
  if (!value) {
    throw new Error(message)
  }
  return value
}

/** Best case guess if for some reason we don't know the actual amount of decimals */
export const DEFAULT_DECIMALS = 18

export const handleTimeout = <T>(promise: Promise<T>, timeout: number, message?: string): Promise<T> =>
  new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id)
      reject(new Error(message || `Promise timed out after ${timeout}ms`))
    }, timeout)
    promise.then(resolve, reject)
  })

/**
 * Generate an array of numbers from 0 to lengthOrStart - 1 or from lengthOrStart to lengthOrStart + length - 1
 * Example: range(3) => [0, 1, 2]
 * Example: range(2, 3) => [2, 3, 4]
 */
export const range = (lengthOrStart: number, length?: number) =>
  length === undefined
    ? Array.from({ length: lengthOrStart }, (_, i) => i)
    : Array.from({ length }, (_, i) => i + lengthOrStart)

export const repeat = <T>(value: T, times: number) => range(times).map(() => value)

export const isEmpty = (obj: object) => Object.keys(obj).length === 0

export const pick = <T, K extends keyof T>(obj: T, ...keys: K[]) =>
  Object.fromEntries(keys.map((key) => [key, obj[key]])) as { [P in K]: T[P] }
