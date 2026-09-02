import { useEffect, useMemo, useState } from 'react'
import { isAddress, isAddressEqual } from 'viem'
import { Transfer } from '@/dex/components/PagePool/index'
import { ROUTE } from '@/dex/constants'
import { useChainId } from '@/dex/hooks/useChainId'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { usePoolsBlacklist } from '@/dex/queries/pools-blacklist.query'
import { useStore } from '@/dex/store/useStore'
import type { PoolUrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import type { Chain } from '@curvefi/prices-api'
import { getLib } from '@evm-ui/features/connect-wallet'
import { useParams } from '@evm-ui/hooks/router'
import { t } from '@evm-ui/lib/i18n'
import { ErrorPage } from '@evm-ui/pages/ErrorPage'
import { q } from '@evm-ui/types/util'

export const PagePool = () => {
  const props = useParams<PoolUrlParams>()
  const { poolIdOrAddress: rPoolIdOrAddress, network: networkId } = props
  const rChainId = useChainId(networkId)
  const poolId = usePoolIdByAddressOrId({ chainId: rChainId, poolIdOrAddress: rPoolIdOrAddress })
  const curveApi = getLib('curveApi')

  const hasDepositAndStake = useStore(state => state.getNetworkConfigFromApi(rChainId).hasDepositAndStake)
  const haveAllPools = useStore(state => state.pools.haveAllPools[rChainId])
  const fetchNewPool = useStore(state => state.pools.fetchNewPool)
  const poolDataCache = useStore(state => (poolId ? state.storeCache.poolsMapper[rChainId]?.[poolId] : undefined))
  const poolData = useStore(state => (poolId ? state.pools.poolsMapper[rChainId]?.[poolId] : undefined))
  const [poolNotFound, setPoolNotFound] = useState(false)

  const poolDataCacheOrApi = useMemo(() => poolData ?? poolDataCache, [poolData, poolDataCache])

  useEffect(() => {
    if (!rChainId || !poolId || curveApi?.chainId !== rChainId || !haveAllPools || poolData || poolDataCache) return
    fetchNewPool(curveApi, poolId)
      .then(found => setPoolNotFound(!found))
      .catch(() => setPoolNotFound(true))
  }, [curveApi, fetchNewPool, haveAllPools, poolId, poolData, poolDataCache, rChainId])

  /**
   * Blacklisted pools are excluded from the pools mapper during initialization,
   * so they cannot be resolved via `usePoolIdByAddressOrId`.
   *
   * Because of the way that legacy code loads pools (using stores and not queries),
   * this creates an ambiguity when `rPoolIdOrAddress` is an address:
   * - `poolId` being undefined could mean the data is still loading
   * - `poolId` being undefined could mean the pool is blacklisted
   *
   * To handle this, we explicitly check against the blacklist when the URL
   * parameter is an address. When `rPoolIdOrAddress` is a pool ID (not an address),
   * the lookup will succeed or fail deterministically, and the `useEffect` above
   * will set `poolNotFound` accordingly.
   */
  const poolAddress = isAddress(rPoolIdOrAddress, {
    strict: false /* address comes from URL which might be lowercase */,
  })
    ? rPoolIdOrAddress
    : undefined
  const { data: blacklist, isLoading: isPoolsBlacklistLoading } = usePoolsBlacklist({
    blockchainId: networkId as Chain,
  })
  const isBlacklisted = useMemo(
    () => poolAddress != null && blacklist?.some(badPool => isAddressEqual(badPool, poolAddress)),
    [blacklist, poolAddress],
  )
  const isPoolAddressNotFound =
    poolAddress != null && haveAllPools && !isPoolsBlacklistLoading && !poolId && !isBlacklisted
  const poolLookupError =
    poolNotFound || isPoolAddressNotFound ? new Error(`${t`Pool`} ${rPoolIdOrAddress} ${t`Not Found`}`) : null
  const poolQuery = q({
    data: poolDataCacheOrApi,
    isLoading: poolDataCacheOrApi == null && poolLookupError == null,
    error: poolLookupError,
  })

  return poolQuery.error || isBlacklisted ? (
    <ErrorPage title="404" subtitle={t`Pool Not Found`} continueUrl={getPath(props, ROUTE.PAGE_POOLS)} />
  ) : (
    <Transfer
      curve={curveApi?.chainId === rChainId ? curveApi : null}
      params={props}
      poolData={poolData}
      poolQuery={poolQuery}
      routerParams={{ rChainId, rPoolIdOrAddress }}
      hasDepositAndStake={hasDepositAndStake}
    />
  )
}
