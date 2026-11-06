import { fromEntries, maybe, range, type Nullish } from '@primitives/objects.utils'
import type { FieldsOf } from '@ui/lib/validation/types'
import type { CreatePoolTokenField, CreatePoolTokenFields } from './types'

export const createPoolTokenField = (index: number): CreatePoolTokenField => `token_${index}`
export const createPoolTokenSymbolField = (index: number): `symbol_${number}` => `symbol_${index}`
export const createPoolTokenDecimalsField = (index: number): `decimals_${number}` => `decimals_${index}`

export const getCreatePoolTokens = <Count extends number | Nullish>(
  values: FieldsOf<CreatePoolTokenFields>,
  tokenCount: Count,
) =>
  maybe(tokenCount, count =>
    range(count).map(index =>
      maybe(values[createPoolTokenField(index)], address => ({
        address,
        symbol: values[createPoolTokenSymbolField(index)] ?? undefined,
        decimals: values[createPoolTokenDecimalsField(index)] ?? undefined,
      })),
    ),
  )

export const getCreatePoolDecimals = <Count extends number | Nullish>(
  values: FieldsOf<CreatePoolTokenFields>,
  tokenCount: Count,
) => maybe(tokenCount, count => range(count).map(index => values[createPoolTokenDecimalsField(index)] ?? undefined))

export const getCreatePoolTokenDefaults = (tokenCount: number) => ({
  ...fromEntries(
    range(tokenCount).flatMap(index => [
      [createPoolTokenField(index), undefined],
      [createPoolTokenSymbolField(index), undefined],
    ]),
  ),
})
