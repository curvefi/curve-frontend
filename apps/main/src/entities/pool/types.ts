import type { ChainQueryParams } from '@/entities/chain/types'
import type { NestedKeys, NestedProperty } from '@/shared/types/nested'
import type { PoolTemplate } from '../../../../../../curve-js/lib/pools'
import { ExtractQueryKeyType } from '@/shared/types/api'
import { poolKeys } from './model'

export type PoolQueryParams = ChainQueryParams & {
  poolId?: string
}

export type PoolMethodResult<M extends NestedKeys<PoolTemplate>> = Awaited<ReturnType<NestedProperty<PoolTemplate, M>>>

export type PoolMethodParameters<M extends NestedKeys<PoolTemplate>> = Parameters<NestedProperty<PoolTemplate, M>>

export type PoolQueryKeyType<K extends keyof typeof poolKeys = keyof typeof poolKeys> = ExtractQueryKeyType<typeof poolKeys, K>

export type CombinedPoolParams  = PoolQueryParams
