import { type PoolData, type RewardsApy } from '@/dex/types/main.types'
import type { INetworkName } from '@curvefi/api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'

export type PoolTag =
  | 'btc'
  | 'crypto'
  | 'kava'
  | 'eth'
  | 'usd'
  | 'others'
  | 'user'
  | 'crvusd'
  | 'tricrypto'
  | 'stableng'
  | 'cross-chain'

export type PoolListItem = PoolData & {
  rewards: RewardsApy | undefined
  volume: Decimal | undefined
  tvl: Decimal | undefined
  hasPosition: boolean | undefined
  network: INetworkName
  url: string
  tags: PoolTag[]
  totalAPR: number
}
