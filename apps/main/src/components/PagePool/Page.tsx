import type { NextPage } from 'next'

import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { ROUTE } from '@/constants'
import { getPath } from '@/utils/utilsRouter'
import networks from '@/networks'
import usePageOnMount from '@/hooks/usePageOnMount'
import useStore from '@/store/useStore'

import { scrollToTop } from '@/utils'
import DocumentHead from '@/layout/default/DocumentHead'
import Transfer from '@/components/PagePool/index'

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
  const poolData = useStore((state) => state.pools.poolsMapper[rChainId]?.[parsedRPoolId])
  const hidePoolsMapper = rChainId ? networks[rChainId].customPoolIds : null

  const { hasDepositAndStake } = getNetworkConfigFromApi(rChainId)

  useEffect(() => {
    scrollToTop()
  }, [])

  useEffect(() => {
    if (hidePoolsMapper) {
      const reRoutePathname = getPath(params, ROUTE.PAGE_POOLS)
      if (!rFormType || !rPoolId || (rPoolId && hidePoolsMapper[rPoolId])) {
        navigate(reRoutePathname)
      } else if (!!curve && pageLoaded && !isLoadingApi && curve.chainId === +rChainId && haveAllPools && !poolData) {
        ;(async () => {
          const foundPoolData = await fetchNewPool(curve, rPoolId)
          if (!foundPoolData) {
            navigate(reRoutePathname)
          }
        })()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    curve?.chainId,
    fetchNewPool,
    haveAllPools,
    isLoadingApi,
    pageLoaded,
    poolData,
    rChainId,
    rFormType,
    rPoolId,
    hidePoolsMapper,
  ])

  return (
    <>
      <DocumentHead title={poolData?.pool?.name ?? 'Pool'} />
      {rChainId &&
        rFormType &&
        rPoolId &&
        poolData?.pool?.id === rPoolId &&
        typeof hasDepositAndStake !== 'undefined' && (
          <Transfer
            curve={curve}
            params={params}
            poolData={poolData}
            poolDataCacheOrApi={poolData}
            routerParams={{ rChainId, rPoolId, rFormType }}
            hasDepositAndStake={hasDepositAndStake}
          />
        )}
    </>
  )
}

export default Page
