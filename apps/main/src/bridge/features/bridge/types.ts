import type { FieldsOf } from '@evm-ui/lib'
import type { ChainQuery, UserQuery } from '@evm-ui/lib/model'
import type { Decimal } from '@primitives/decimal.utils'

export type BridgeQuery = ChainQuery & UserQuery & { amount: Decimal }
export type BridgeParams = FieldsOf<BridgeQuery>
