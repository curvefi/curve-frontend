'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import Transfer from '@/dex/components/PagePool/index'
import { ROUTE } from '@/dex/constants'
import useStore from '@/dex/store/useStore'
import type { CurveApi, PoolUrlParams } from '@/dex/types/main.types'
import { getPath, useChainId } from '@/dex/utils/utilsRouter'
import { isLoading, useConnection } from '@ui-kit/features/connect-wallet'

export const PagePool = (props: PoolUrlParams) => {
  const { push } = useRouter()
  const { lib: curve = null, connectState } = useConnection<CurveApi>()
  const {
    pool: rPoolId,
    formType: [rFormType],
    network: networkName,
  } = props
  const rChainId = useChainId(networkName)

  const hasDepositAndStake = useStore((state) => state.getNetworkConfigFromApi(rChainId).hasDepositAndStake)
  const haveAllPools = useStore((state) => state.pools.haveAllPools[rChainId])
  const fetchNewPool = useStore((state) => state.pools.fetchNewPool)
  const poolDataCache = useStore((state) => state.storeCache.poolsMapper[rChainId]?.[rPoolId])
  const poolData = useStore((state) => state.pools.poolsMapper[rChainId]?.[rPoolId])
  const network = useStore((state) => state.networks.networks[rChainId])

  const poolDataCacheOrApi = useMemo(() => poolData || poolDataCache, [poolData, poolDataCache])

  useEffect(() => {
    if (!rChainId) return

    const {
      pool: rPoolId,
      formType: [rFormType],
    } = props
    const reRoutePathname = getPath(props, ROUTE.PAGE_POOLS)
    if (!rFormType || network.excludePoolsMapper[rPoolId]) {
      push(reRoutePathname)
      return
    }
    if (!isLoading(connectState) && curve?.chainId === rChainId && haveAllPools && !poolData) {
      void (async () => {
        const foundPoolData = await fetchNewPool(curve, rPoolId)
        if (!foundPoolData) {
          push(reRoutePathname)
        }
      })()
    }
  }, [curve, fetchNewPool, haveAllPools, network, connectState, props, poolData, push, rChainId])

  return (
    rFormType &&
    poolDataCacheOrApi?.pool?.id === rPoolId &&
    hasDepositAndStake != null && (
      <Transfer
        curve={curve}
        params={props}
        poolData={poolData}
        poolDataCacheOrApi={poolDataCacheOrApi}
        routerParams={{ rChainId, rPoolId, rFormType }}
        hasDepositAndStake={hasDepositAndStake}
      />
    )
  )
}
