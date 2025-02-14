import type { NextPage } from 'next'
import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ROUTE } from '@/dex/constants'
import { getPath } from '@/dex/utils/utilsRouter'
import usePageOnMount from '@/dex/hooks/usePageOnMount'
import useStore from '@/dex/store/useStore'
import { scrollToTop } from '@/dex/utils'
import DocumentHead from '@/dex/layout/default/DocumentHead'
import Transfer from '@/dex/components/PagePool/index'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { pageLoaded, routerParams, curve } = usePageOnMount(params, location, navigate)
  const { rChainId, rPoolId, rFormType } = routerParams

  const parsedRPoolId = rPoolId || ''
  const getNetworkConfigFromApi = useStore((state) => state.getNetworkConfigFromApi)
  const isLoadingApi = useStore((state) => state.isLoadingApi)
  const haveAllPools = useStore((state) => state.pools.haveAllPools[rChainId])
  const fetchNewPool = useStore((state) => state.pools.fetchNewPool)
  const poolDataCache = useStore((state) => state.storeCache.poolsMapper[rChainId]?.[parsedRPoolId])
  const poolData = useStore((state) => state.pools.poolsMapper[rChainId]?.[parsedRPoolId])
  const network = useStore((state) => state.networks.networks[rChainId])

  const { hasDepositAndStake } = getNetworkConfigFromApi(rChainId)

  const poolDataCacheOrApi = useMemo(() => poolData || poolDataCache, [poolData, poolDataCache])

  useEffect(() => {
    scrollToTop()
  }, [])

  useEffect(() => {
    if (!rChainId) return

    const { excludePoolsMapper } = network
    const reRoutePathname = getPath(params, ROUTE.PAGE_POOLS)
    if (!rFormType || !rPoolId || (rPoolId && excludePoolsMapper[rPoolId])) {
      navigate(reRoutePathname)
    } else if (!!curve && pageLoaded && !isLoadingApi && curve.chainId === +rChainId && haveAllPools && !poolData) {
      ;(async () => {
        const foundPoolData = await fetchNewPool(curve, rPoolId)
        if (!foundPoolData) {
          navigate(reRoutePathname)
        }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve?.chainId, fetchNewPool, haveAllPools, isLoadingApi, pageLoaded, poolData, rChainId, rFormType, rPoolId])

  return (
    <>
      <DocumentHead title={poolDataCacheOrApi?.pool?.name ?? 'Pool'} />
      {rChainId && rFormType && rPoolId && poolDataCacheOrApi?.pool?.id === rPoolId && hasDepositAndStake != null && (
        <Transfer
          curve={curve}
          params={params}
          poolData={poolData}
          poolDataCacheOrApi={poolDataCacheOrApi}
          routerParams={{ rChainId, rPoolId, rFormType }}
          hasDepositAndStake={hasDepositAndStake}
        />
      )}
    </>
  )
}

export default Page
