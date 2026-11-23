import type { Nullish } from '@primitives/objects.utils'
export type FieldName<T> = Extract<keyof T, string>
export type ValidationKey<T> = FieldName<T> | 'root'
export type ValidationErrors<T> = Partial<Record<ValidationKey<T>, Error>>

/** Map over keyof T directly to preserve unions, keeping only string field names. */
export type FieldsOf<T> = { -readonly [K in keyof T as Extract<K, string>]?: T[K] | Nullish }
