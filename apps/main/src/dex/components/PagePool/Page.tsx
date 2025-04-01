'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import Transfer from '@/dex/components/PagePool/index'
import { ROUTE } from '@/dex/constants'
import usePageOnMount from '@/dex/hooks/usePageOnMount'
import useStore from '@/dex/store/useStore'
import type { PoolUrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import { useApiStore } from '@ui-kit/shared/useApiStore'

const Page = (params: PoolUrlParams) => {
  const { push } = useRouter()
  const { pageLoaded, routerParams, curve } = usePageOnMount()
  const { rChainId, rPoolId, rFormType } = routerParams

  const parsedRPoolId = rPoolId || ''
  const getNetworkConfigFromApi = useStore((state) => state.getNetworkConfigFromApi)
  const isLoadingApi = useApiStore((state) => state.isLoadingCurve)
  const haveAllPools = useStore((state) => state.pools.haveAllPools[rChainId])
  const fetchNewPool = useStore((state) => state.pools.fetchNewPool)
  const poolDataCache = useStore((state) => state.storeCache.poolsMapper[rChainId]?.[parsedRPoolId])
  const poolData = useStore((state) => state.pools.poolsMapper[rChainId]?.[parsedRPoolId])
  const network = useStore((state) => state.networks.networks[rChainId])

  const { hasDepositAndStake } = getNetworkConfigFromApi(rChainId)

  const poolDataCacheOrApi = useMemo(() => poolData || poolDataCache, [poolData, poolDataCache])

  useEffect(() => {
    if (!rChainId) return

    const { excludePoolsMapper } = network
    const reRoutePathname = getPath(params, ROUTE.PAGE_POOLS)
    if (!rFormType || !rPoolId || (rPoolId && excludePoolsMapper[rPoolId])) {
      push(reRoutePathname)
    } else if (!!curve && pageLoaded && !isLoadingApi && curve.chainId === +rChainId && haveAllPools && !poolData) {
      ;(async () => {
        const foundPoolData = await fetchNewPool(curve, rPoolId)
        if (!foundPoolData) {
          push(reRoutePathname)
        }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve?.chainId, fetchNewPool, haveAllPools, isLoadingApi, pageLoaded, poolData, rChainId, rFormType, rPoolId])

  return (
    rChainId &&
    rFormType &&
    rPoolId &&
    poolDataCacheOrApi?.pool?.id === rPoolId &&
    hasDepositAndStake != null && (
      <Transfer
        curve={curve}
        params={params}
        poolData={poolData}
        poolDataCacheOrApi={poolDataCacheOrApi}
        routerParams={{ rChainId, rPoolId, rFormType }}
        hasDepositAndStake={hasDepositAndStake}
      />
    )
  )
}

export default Page
