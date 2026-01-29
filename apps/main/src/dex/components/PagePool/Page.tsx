import { useEffect, useMemo, useState } from 'react'
import { isAddress, isAddressEqual, type Address } from 'viem'
import { Transfer } from '@/dex/components/PagePool/index'
import { ROUTE } from '@/dex/constants'
import { useNetworkByChain } from '@/dex/entities/networks'
import { useChainId } from '@/dex/hooks/useChainId'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { usePoolsBlacklist } from '@/dex/queries/pools-blacklist.query'
import { useStore } from '@/dex/store/useStore'
import type { PoolUrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import type { Chain } from '@curvefi/prices-api'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useNavigate, useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'

export const PagePool = () => {
  const push = useNavigate()
  const { curveApi = null, isHydrated } = useCurve()
  const props = useParams<PoolUrlParams>()
  const { poolIdOrAddress: rPoolIdOrAddress, formType: rFormType, network: networkId } = props
  const rChainId = useChainId(networkId)
  const poolId = usePoolIdByAddressOrId({ chainId: rChainId, poolIdOrAddress: rPoolIdOrAddress })

  const hasDepositAndStake = useStore((state) => state.getNetworkConfigFromApi(rChainId).hasDepositAndStake)
  const haveAllPools = useStore((state) => state.pools.haveAllPools[rChainId])
  const fetchNewPool = useStore((state) => state.pools.fetchNewPool)
  const poolDataCache = useStore((state) => state.storeCache.poolsMapper[rChainId]?.[poolId ?? ''])
  const poolData = useStore((state) => state.pools.poolsMapper[rChainId]?.[poolId ?? ''])
  const { data: network } = useNetworkByChain({ chainId: rChainId })
  const [poolNotFound, setPoolNotFound] = useState(false)

  const poolDataCacheOrApi = useMemo(() => poolData || poolDataCache, [poolData, poolDataCache])

  useEffect(() => {
    if (!rChainId || !poolId || curveApi?.chainId !== rChainId || !haveAllPools || poolData) return
    fetchNewPool(curveApi, poolId)
      .then((found) => setPoolNotFound(!found))
      .catch(() => setPoolNotFound(true))
  }, [curveApi, fetchNewPool, haveAllPools, network, poolId, poolData, push, rChainId])

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
  const { data: blacklist } = usePoolsBlacklist({ blockchainId: networkId as Chain })
  const isBlacklisted = useMemo(
    () =>
      isAddress(rPoolIdOrAddress, { strict: false }) &&
      blacklist?.some((badPool) => isAddressEqual(badPool, rPoolIdOrAddress as Address)),
    [blacklist, rPoolIdOrAddress],
  )

  return !rFormType || poolNotFound || isBlacklisted ? (
    <ErrorPage title="404" subtitle={t`Pool Not Found`} continueUrl={getPath(props, ROUTE.PAGE_POOLS)} />
  ) : (
    rFormType && poolId && poolDataCacheOrApi?.pool?.id === poolId && hasDepositAndStake != null && isHydrated && (
      <Transfer
        curve={curveApi}
        params={props}
        poolData={poolData}
        poolDataCacheOrApi={poolDataCacheOrApi}
        routerParams={{ rChainId, rPoolIdOrAddress, rFormType }}
        hasDepositAndStake={hasDepositAndStake}
      />
    )
  )
}
