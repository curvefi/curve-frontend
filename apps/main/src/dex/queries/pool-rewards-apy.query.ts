import { BigNumber } from 'bignumber.js'
import { useCallback, useMemo } from 'react'
import { test } from 'vest'
import { fetchNetworks } from '@/dex/entities/networks'
import type { ChainId, NetworkConfig, RewardCrv } from '@/dex/types/main.types'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { requireLib, useCurve } from '@evm-ui/features/connect-wallet'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { type ChainParams, type PoolParams, type PoolQuery, rootKeys } from '@evm-ui/lib/model'
import { chainValidationGroup } from '@evm-ui/lib/model/query/chain-validation'
import { curveApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { poolValidationGroup } from '@evm-ui/lib/model/query/pool-validation'
import { type QueriesResults, useQueries } from '@tanstack/react-query'
import { combineQueriesToObject } from '@ui/features/queries/combine'
import { queryFactory } from '@ui/features/queries/factory'
import type { QueryData } from '@ui/features/queries/util'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'
import { fulfilledValue, isValidAddress } from '../utils'

type RewardOther = {
  apy: number
  decimals?: number
  gaugeAddress: string
  name?: string
  symbol: string
  tokenAddress: string
  tokenPrice?: number
}

function separateCrvReward<T extends { symbol: string; apy: number | string }>(rewards: T[]) {
  if (Array.isArray(rewards)) {
    const crvIdx = rewards.findIndex(r => r.symbol === 'CRV')

    if (crvIdx !== -1) {
      // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
      const crvReward = rewards.splice(crvIdx, 1)
      return [rewards, [crvReward[0].apy]]
    }
  }
  return [rewards, []]
}

function filterRewardsApy<T extends { apy: number | string }>(rewards: T[]) {
  if (Array.isArray(rewards)) {
    return rewards.filter(r => Number(r.apy) !== 0)
  }
  return []
}

const poolAllRewardsApy = async (network: NetworkConfig, p: PoolTemplate, useApi: boolean) => {
  const resp = {
    poolId: p.id,
    base: { day: '0', week: '0' },
    other: [] as RewardOther[],
    crv: [0, 0],
    error: {} as Record<string, boolean>,
  }

  const { chainId, isCrvRewardsEnabled } = network

  // get base vAPY
  if (!isLiteChain(chainId)) {
    const DEFAULT_BASE = { day: '0', week: '0' }
    const [baseApyResult] = await Promise.allSettled([p.stats.baseApy()])
    resp.base = fulfilledValue(baseApyResult) ?? DEFAULT_BASE
    if (baseApyResult.status === 'rejected') {
      if (p.inApi) resp.error.base = true
    } else {
      resp.base.day = new BigNumber(resp.base.day).toFixed(8)
      resp.base.week = new BigNumber(resp.base.week).toFixed(8)
    }
  }

  if (!isValidAddress(p.gauge.address)) return resp

  // both crv and incentives (others) are in one call
  if (p.rewardsOnly()) {
    const [rewardsResult] = await Promise.allSettled([p.stats.rewardsApy(useApi)])
    const rewards = fulfilledValue(rewardsResult)

    if (rewardsResult.status === 'rejected') {
      resp.error.others = true
      resp.error.crv = true
    }

    if (rewardsResult.status === 'fulfilled' && rewards) {
      const [others, [baseApy, boostedApy]] = separateCrvReward(filterRewardsApy(rewards)) as [
        RewardOther[],
        RewardCrv[],
      ]

      // others rewards
      resp.other = others.filter(other => +other.apy > 0)
      resp.crv = +baseApy > 0 || +boostedApy > 0 ? [baseApy, boostedApy] : [0, 0]
    }
    return resp
  }

  const [otherResult, crvResult] = await Promise.allSettled([p.stats.rewardsApy(useApi), p.stats.tokenApy(useApi)])

  // others rewards
  const others = fulfilledValue(otherResult) ?? []
  if (otherResult.status === 'rejected') {
    resp.error.others = true
  } else {
    for (const other of others) {
      if (chainId === 8453) {
        if (other.symbol !== 'CRV' && +other.apy > 0) {
          // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
          resp.other.push(other)
        }
      } else if (+other.apy > 0) {
        // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
        resp.other.push(other)
      }
    }
  }

  // crv rewards
  if (crvResult.status === 'rejected' && isCrvRewardsEnabled) {
    resp.error.crv = true
  }
  if (crvResult.status === 'fulfilled' && !!crvResult.value) {
    const [baseApy] = crvResult.value
    const crv = fulfilledValue(crvResult)
    if (crv && baseApy && !Number.isNaN(baseApy)) {
      resp.crv = crv
    }
  }
  return resp
}

type PoolRewardsApyQuery = PoolQuery<ChainId> & { useApi: boolean }
type PoolRewardsApyParams = FieldsOf<PoolRewardsApyQuery>

const {
  useQuery: usePoolRewardsApyQuery,
  getQueryOptions: getPoolRewardsApyQueryOptions,
  fetchQuery: fetchPoolRewardsApy,
  getQueryData: getPoolRewardsApyQueryData,
  invalidate: invalidatePoolRewardsApyQuery,
} = queryFactory({
  category: 'dex.pool',
  queryKey: ({ chainId, poolId, useApi }: PoolRewardsApyParams) =>
    [...rootKeys.pool({ chainId, poolId }), 'rewardsApy', { useApi }] as const,
  queryFn: async ({ chainId, poolId, useApi }: PoolRewardsApyQuery) => {
    const pool = requireLib('curveApi').getPool(poolId)
    const networks = await fetchNetworks()
    return await poolAllRewardsApy(networks[chainId], pool, useApi)
  },
  validationSuite: createValidationSuite((params: PoolRewardsApyParams) => {
    curveApiValidationGroup(params)
    chainValidationGroup(params)
    poolValidationGroup(params)
    test('useApi', () => {
      enforce(params.useApi).isBoolean()
    })
  }),
})

export { fetchPoolRewardsApy, getPoolRewardsApyQueryData }

export const invalidatePoolRewardsApy = (params: PoolParams<ChainId>) =>
  Promise.all([true, false].map(useApi => invalidatePoolRewardsApyQuery({ ...params, useApi })))

/** Prefer on-chain rewards for pool details when a wallet is connected. */
export function usePoolRewardsApy(params: PoolParams<ChainId>) {
  const { curveApi, isHydrated } = useCurve()
  return usePoolRewardsApyQuery({ ...params, useApi: !curveApi?.signerAddress }, isHydrated)
}

type PoolRewardsApyOptions = ReturnType<typeof getPoolRewardsApyQueryOptions>

/** Slop coded hook only for the dashboard to fetch multiple APYs all at once that will need a rewrite anyway. */
export function usePoolsRewardsApy({ chainId, poolIds = [] }: ChainParams<ChainId> & { poolIds?: string[] }) {
  const { isHydrated } = useCurve()
  const uniquePoolIds = useMemo(() => Array.from(new Set(poolIds)), [poolIds])
  return useQueries({
    queries: useMemo(
      () =>
        uniquePoolIds.map(poolId =>
          getPoolRewardsApyQueryOptions(
            { chainId, poolId, useApi: false /* need a connected wallet anyway */ },
            isHydrated,
          ),
        ),
      [chainId, uniquePoolIds, isHydrated],
    ),
    combine: useCallback(
      (results: QueriesResults<PoolRewardsApyOptions[]>) => combineQueriesToObject(results, uniquePoolIds),
      [uniquePoolIds],
    ),
  })
}

export type RewardsApy = QueryData<typeof usePoolRewardsApyQuery>
