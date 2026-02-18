import type { FieldsOf } from '@ui-kit/lib'
import type { ChainQuery, UserQuery } from '@ui-kit/lib/model'
import type { Decimal } from '@ui-kit/utils'

export type BridgeQuery = ChainQuery & UserQuery & { amount: Decimal }
export type BridgeParams = FieldsOf<BridgeQuery>
