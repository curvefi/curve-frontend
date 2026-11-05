import { fromEntries, maybe, range, type Nullish } from '@primitives/objects.utils'
import type { FieldsOf } from '@ui/lib/validation/types'
import type { CreatePoolTokenField, CreatePoolTokenFields } from './types'

export const createPoolTokenField = (index: number): CreatePoolTokenField => `token_${index}`

export const getCreatePoolTokens = <Count extends number | Nullish>(
  values: FieldsOf<CreatePoolTokenFields>,
  tokenCount: Count,
) => maybe(tokenCount, count => range(count).map(index => values[createPoolTokenField(index)] ?? undefined))

export const getCreatePoolTokenDefaults = (tokenCount: number): CreatePoolTokenFields =>
  fromEntries(range(tokenCount).map(index => [createPoolTokenField(index), undefined]))
