'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import Transfer from '@/dex/components/PagePool/index'
import { ROUTE } from '@/dex/constants'
import { useChainId } from '@/dex/hooks/useChainId'
import useStore from '@/dex/store/useStore'
import type { PoolUrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import { isLoading, useConnection } from '@ui-kit/features/connect-wallet'

export const PagePool = (props: PoolUrlParams) => {
  const { push } = useRouter()
  const { curveApi = null, connectState } = useConnection()
  const { pool: rPoolId, formType: [rFormType] = [], network: networkId } = props
  const rChainId = useChainId(networkId)

  const hasDepositAndStake = useStore(state => state.getNetworkConfigFromApi(rChainId).hasDepositAndStake)
  const haveAllPools = useStore(state => state.pools.haveAllPools[rChainId])
  const fetchNewPool = useStore(state => state.pools.fetchNewPool)
  const poolDataCache = useStore(state => state.storeCache.poolsMapper[rChainId]?.[rPoolId])
  const poolData = useStore(state => state.pools.poolsMapper[rChainId]?.[rPoolId])
  const network = useStore(state => state.networks.networks[rChainId])

  const poolDataCacheOrApi = useMemo(() => poolData || poolDataCache, [poolData, poolDataCache])

  useEffect(() => {
    if (!rChainId) return

    const { pool: rPoolId, formType: [rFormType] = [] } = props
    const reRoutePathname = getPath(props, ROUTE.PAGE_POOLS)
    if (!rFormType || network.excludePoolsMapper[rPoolId]) {
      push(reRoutePathname)
      return
    }
    if (!isLoading(connectState) && curveApi?.chainId === rChainId && haveAllPools && !poolData) {
      void (async () => {
        const foundPoolData = await fetchNewPool(curveApi, rPoolId)
        if (!foundPoolData) {
          push(reRoutePathname)
        }
      })()
    }
  }, [curveApi, fetchNewPool, haveAllPools, network, connectState, props, poolData, push, rChainId])

  return (
    rFormType &&
    poolDataCacheOrApi?.pool?.id === rPoolId &&
    hasDepositAndStake != null && (
      <Transfer
        curve={curveApi}
        params={props}
        poolData={poolData}
        poolDataCacheOrApi={poolDataCacheOrApi}
        routerParams={{ rChainId, rPoolId, rFormType }}
        hasDepositAndStake={hasDepositAndStake}
      />
    )
  )
}
