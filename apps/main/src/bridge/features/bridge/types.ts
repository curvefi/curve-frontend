import type { Decimal } from '@primitives/decimal.utils'
import type { FieldsOf } from '@evm-ui/lib'
import type { ChainQuery, UserQuery } from '@evm-ui/lib/model'

export type BridgeQuery = ChainQuery & UserQuery & { amount: Decimal }
export type BridgeParams = FieldsOf<BridgeQuery>
