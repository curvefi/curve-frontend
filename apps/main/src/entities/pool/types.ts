import type { ExtractQueryKeyType } from '@/shared/types/api'
import type { ChainQueryParams } from '@/entities/chain/types'

import { poolKeys as keys } from '@/entities/pool/model'

// keys
export type PoolQueryKeyType<K extends keyof typeof keys> = ExtractQueryKeyType<typeof keys, K>

export type PoolQueryParams = ChainQueryParams & {
  poolId?: string
}

export type PoolBase = {
  chainId: ChainId | undefined
  poolId: string | undefined
}

export type PoolTokensList = PoolBase & {
  isWrapped: boolean
}

export type PoolSeedAmounts = PoolBase & {
  isSeed: boolean | null
  firstAmount: string
  useUnderlying: boolean | null
}

export type PoolCurrencyReserves = PoolBase & {
  isWrapped: boolean
}

// response
export type PoolCurrencyReservesResp = {
  poolId: string
  tokens: CurrencyReservesToken[]
  total: number | null
  totalUsd: number | null
}

export type PoolDetailsResp = {
  rewardsApy: {
    poolId: string
    base: RewardBase
    other: RewardOther[]
    crv: RewardCrv[]
    error: { [rewardType: string]: boolean }
  } | null
  volume: string
  tvl: string
  parameters: PoolParameters | null
}

export type PoolTokenListResp = {
  tokens: Token[]
  tokensMapper: { [address: string]: Token }
}

export type PoolSeedAmountsResp = {
  token: string
  tokenAddress: string
  amount: string
}
