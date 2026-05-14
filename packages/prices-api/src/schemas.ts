import { z } from 'zod/v4'
import type { Address, Hex } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { TimestampResponse } from './timestamp'
import { chains } from './index'

export const address = z.string().transform(value => value as Address)
export const chain = z.enum(chains)
export const decimal = z.string().transform(value => value as Decimal)
export const hex = z.string().transform(value => value as Hex)
export const timestampResponse = z.union([z.number(), z.string()]).transform(value => value as TimestampResponse)

type Primitive = bigint | boolean | null | number | string | symbol | undefined

/**
 * Converts a snake_case string literal into its camelCase equivalent.
 *
 * Used by `Camelize` to keep the inferred output type in sync with
 * `camelizeKeys` after response schemas transform API payload keys.
 */
export type CamelCase<Value extends string> = Value extends `${infer Head}_${infer Tail}`
  ? `${Head}${Capitalize<CamelCase<Tail>>}`
  : Value

/**
 * Type-level mirror of `camelizeKeys`.
 *
 * TypeScript can infer that `camelizeKeys` returns a value, but it cannot infer
 * that `String.replace` and `Object.fromEntries` rename specific keys like
 * `vote_id` to `voteId`. Zod uses this return type for
 * `.transform(camelizeKeys)`, so this mapped type preserves the exact
 * transformed schema shape.
 *
 * Primitive values are preserved first so branded primitives like `Timestamp`
 * stay intact, arrays are camelized item-by-item, and object string keys are
 * converted with `CamelCase` while nested values are transformed recursively.
 * Non-string object keys are preserved.
 */
export type Camelize<Value> = Value extends Primitive
  ? Value
  : Value extends readonly (infer Item)[]
    ? Camelize<Item>[]
    : Value extends object
      ? { [Key in keyof Value as Key extends string ? CamelCase<Key> : Key]: Camelize<Value[Key]> }
      : Value

/**
 * Recursively converts snake_case object keys to camelCase.
 *
 * This is intended for Zod response transforms where API payloads use
 * snake_case keys but package consumers should receive camelCase keys. Arrays
 * are transformed item-by-item, nested objects are transformed recursively, and
 * primitive values are returned unchanged.
 */
export const camelizeKeys = <Value>(value: Value): Camelize<Value> => {
  if (Array.isArray(value)) {
    return value.map(camelizeKeys) as Camelize<Value>
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [
        key.replace(/_([a-zA-Z0-9])/g, (_, character: string) => character.toUpperCase()),
        camelizeKeys(nested),
      ]),
    ) as Camelize<Value>
  }

  return value as Camelize<Value>
}
