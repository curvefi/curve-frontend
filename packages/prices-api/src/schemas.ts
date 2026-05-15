import { z } from 'zod/v4'
import type { Address, Hex } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { TimestampResponse } from './timestamp'
import { chains } from './index'

type Primitive = bigint | boolean | null | number | string | symbol | undefined

export type CamelCase<Value extends string> = Value extends `${infer Head}_${infer Tail}`
  ? `${Head}${Capitalize<CamelCase<Tail>>}`
  : Value

export type Camelize<Value> = Value extends Primitive
  ? Value
  : Value extends readonly (infer Item)[]
    ? Camelize<Item>[]
    : Value extends object
      ? { [Key in keyof Value as Key extends string ? CamelCase<Key> : Key]: Camelize<Value[Key]> }
      : Value

export const address = z.string().transform(value => value as Address)
export const chain = z.enum(chains)
export const decimal = z.string().transform(value => value as Decimal)
export const hex = z.string().transform(value => value as Hex)
export const timestampResponse = z.union([z.number(), z.string()]).transform(value => value as TimestampResponse)

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
