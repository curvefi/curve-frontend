import { BigNumber } from 'bignumber.js'
import { fetchNetworks } from '@/dex/entities/networks'
import { useLitePool } from '@/dex/queries/lite-pool.query'
import { usePoolPricesApi } from '@/dex/queries/pool-prices-api.query'
import type { ChainId, NetworkConfig } from '@/dex/types/main.types'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import type { V2PoolDetails } from '@curvefi/prices-api/pools'
import { requireLib, useCurve } from '@evm-ui/features/connect-wallet'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { curvePoolValidationSuite } from '@evm-ui/queries/validation/pool-validation'
import { isValidAddress } from '@evm-ui/utils'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { litePoolToRowData } from '@ui/features/pool-list/utils'
import { fallbackQ, mapQuery, q } from '@ui/features/queries/util'
import { fulfilledValue } from '../utils'

const NO_API = false

type RewardCrv = number
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

const poolAllRewardsApy = async (network: NetworkConfig, p: PoolTemplate) => {
  const resp = {
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
      // Curve-js converts numbers to string with .toFixed(8) for unknown reason. We probably want to replace this with `decimal` soon.
      resp.base.day = new BigNumber(resp.base.day).toFixed(8)
      resp.base.week = new BigNumber(resp.base.week).toFixed(8)
    }
  }

  if (!isValidAddress(p.gauge.address)) return resp

  // both crv and incentives (others) are in one call
  if (p.rewardsOnly()) {
    const [rewardsResult] = await Promise.allSettled([p.stats.rewardsApy(NO_API)])
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

  const [otherResult, crvResult] = await Promise.allSettled([p.stats.rewardsApy(NO_API), p.stats.tokenApy(NO_API)])

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

const poolPricesApiRewardsApy = (
  pool: Pick<
    V2PoolDetails,
    'baseDailyApr' | 'baseWeeklyApr' | 'extraRewardsApr' | 'crvApr' | 'crvAprBoosted' | 'gauges'
  >,
) => ({
  base: {
    // Curve-js converts numbers to string with .toFixed(8) for unknown reason. We probably want to replace this with `decimal` soon.
    day: new BigNumber(pool.baseDailyApr ?? 0).toFixed(8),
    week: new BigNumber(pool.baseWeeklyApr ?? 0).toFixed(8),
  },
  other: pool.extraRewardsApr.flatMap(({ address, apr, decimals, name, symbol, price }) =>
    notFalsy(
      address &&
        apr > 0 && {
          apy: apr,
          decimals: decimals ?? undefined,
          gaugeAddress: pool.gauges[0],
          name: name ?? undefined,
          symbol: symbol || name || address,
          tokenAddress: address,
          tokenPrice: price ?? undefined,
        },
    ),
  ),
  crv: [pool.crvApr ?? 0, pool.crvAprBoosted ?? 0],
  error: {} as Record<string, boolean>,
})

const { useQuery: usePoolRewardsApyQuery, invalidate: invalidatePoolRewardsApy } = hydratedQueryFactory({
  category: 'dex.pool',
  queryKey: ({ chainId, poolAddress }: PoolParams<ChainId>) => ({ name: 'rewardsApy', chainId, poolAddress }) as const,
  queryFn: async ({ chainId, poolAddress }: PoolQuery<ChainId>) => {
    const pool = requireLib('curveApi').getPool(poolAddress)
    const networks = await fetchNetworks()
    return await poolAllRewardsApy(networks[chainId], pool)
  },
  validationSuite: curvePoolValidationSuite,
})

export { invalidatePoolRewardsApy }

export const usePoolRewardsApy = (params: PoolParams<ChainId>) =>
  fallbackQ(
    q(usePoolRewardsApyQuery(params, useCurve().curveApi?.isNoRPC === false)),
    mapQuery(usePoolPricesApi(params, params.chainId == null || !isLiteChain(params.chainId)), poolPricesApiRewardsApy),
    mapQuery(useLitePool(params), pool =>
      maybe(pool, pool => {
        const { gauges, ...rates } = litePoolToRowData(pool)
        return poolPricesApiRewardsApy({
          ...rates,
          gauges: gauges.map(gauge => gauge.address),
          crvApr: pool.gaugeIsKilled ? 0 : rates.crvApr,
          crvAprBoosted: pool.gaugeIsKilled ? 0 : rates.crvAprBoosted,
        })
      }),
    ),
  )
