type Falsy = false | 0 | '' | null | undefined
export type PartialRecord<Key extends keyof any, Value> = Partial<Record<Key, Value>>

export const objectKeys = <T extends object>(values: T): (keyof T)[] => Object.keys(values) as (keyof T)[]

export const objectValues = <T, K extends string = string>(values: Record<K, T>): T[] => Object.values<T>(values)

export const fromEntries = <K extends string, V>(values: (readonly [K, V])[]): Record<K, V> =>
  Object.fromEntries(values) as unknown as Record<K, V>

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

// Object.entries with better type inference
export const recordEntries = <K extends string, T>(obj: Record<K, T> | PartialRecord<K, T>): [K, T][] =>
  Object.entries(obj) as [K, T][]

export const notFalsy = <T>(...items: (T | Falsy)[]): T[] => items.filter(Boolean) as T[]
