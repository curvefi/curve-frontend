import type { ChainQueryParams } from '@/entities/chain/types'
import { ExtractQueryKeyType } from '@/shared/types/api'
import { poolKeys } from '@/entities/pool/model'
import type curveApi from '@curvefi/api'

export type PoolQueryParams = ChainQueryParams & {
  poolId?: string
}

export type PoolQueryKeyType<K extends keyof typeof poolKeys> = ExtractQueryKeyType<typeof poolKeys, K>

// note: curvejs doesn't export these types, so we extract them from the return types
type IPoolsApiResult = Awaited<ReturnType<typeof curveApi['getPoolsDataFromApi']>>
export type IPoolType = keyof IPoolsApiResult & string
export type IExtendedPoolsDataFromApi = IPoolsApiResult[IPoolType]
export type IPoolDataFromApi = IExtendedPoolsDataFromApi['poolData'][0]
