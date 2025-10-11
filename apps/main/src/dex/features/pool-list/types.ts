import { type PoolData, type RewardsApy, type Tvl, type Volume } from '@/dex/types/main.types'
import type { INetworkName } from '@curvefi/api/lib/interfaces'

export const PoolTags = [
  'btc',
  'crypto',
  'kava',
  'eth',
  'usd',
  'others',
  'user',
  'crvusd',
  'tricrypto',
  'stableng',
  'cross-chain',
] as const

export type PoolTag = (typeof PoolTags)[number]

// It sucks to use {} as default but tanstack table does not like undefined for deeply nested objects
export type PoolListItem = PoolData & {
  rewards: RewardsApy | undefined
  volume: Volume | undefined
  tvl: Tvl | undefined
  hasPosition: boolean | undefined
  network: INetworkName
  url: string
  tags: PoolTag[]
}
