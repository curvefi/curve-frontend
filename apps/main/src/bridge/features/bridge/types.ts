import type { Decimal } from '@primitives/decimal.utils'
import type { FieldsOf } from '@ui-kit/lib'
import type { ChainQuery, UserQuery } from '@ui-kit/lib/model'
import type { LayerZeroToken } from './layerzero'

export type BridgeFormValues = {
  fromChainId: number
  toChainId: number
  token: LayerZeroToken
  amount: Decimal | undefined
  min: number | undefined
  max: number | undefined
  walletBalance: Decimal | undefined
}

export type BridgeQuery = ChainQuery & UserQuery & { amount: Decimal }
export type BridgeParams = FieldsOf<BridgeQuery>
