import { type PoolData, type RewardsApy, type Tvl, type Volume } from '@/dex/types/main.types'
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
  volume: Volume | undefined
  tvl: Tvl | undefined
  hasPosition: boolean | undefined
  network: INetworkName
  url: string
  tags: PoolTag[]
  totalAPR: number
}
