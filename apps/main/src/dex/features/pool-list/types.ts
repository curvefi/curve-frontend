import { type PoolData, type RewardsApy, type Tvl } from '@/dex/types/main.types'
import type { INetworkName } from '@curvefi/api/lib/interfaces'

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
  volume: string | undefined
  tvl: Tvl | undefined
  hasPosition: boolean | undefined
  network: INetworkName
  url: string
  tags: PoolTag[]
  totalAPR: number
}
