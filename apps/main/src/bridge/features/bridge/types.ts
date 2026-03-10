import type { Decimal } from '@primitives/decimal.utils'
import type { FieldsOf } from '@ui-kit/lib'
import type { ChainQuery, UserQuery } from '@ui-kit/lib/model'

export type BridgeQuery = ChainQuery & UserQuery & { amount: Decimal }
export type BridgeParams = FieldsOf<BridgeQuery>
