import { useEffect, useMemo, useState } from 'react'
import Transfer from '@/dex/components/PagePool/index'
import { ROUTE } from '@/dex/constants'
import { useNetworkByChain } from '@/dex/entities/networks'
import { useChainId } from '@/dex/hooks/useChainId'
import useStore from '@/dex/store/useStore'
import type { PoolUrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { useNavigate, useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'

export const PagePool = () => {
  const push = useNavigate()
  const { curveApi = null } = useConnection()
  const props = useParams<PoolUrlParams>()
  const { pool: rPoolId, formType: rFormType, network: networkId } = props
  const rChainId = useChainId(networkId)

  const hasDepositAndStake = useStore((state) => state.getNetworkConfigFromApi(rChainId).hasDepositAndStake)
  const haveAllPools = useStore((state) => state.pools.haveAllPools[rChainId])
  const fetchNewPool = useStore((state) => state.pools.fetchNewPool)
  const poolDataCache = useStore((state) => state.storeCache.poolsMapper[rChainId]?.[rPoolId])
  const poolData = useStore((state) => state.pools.poolsMapper[rChainId]?.[rPoolId])
  const { data: network } = useNetworkByChain({ chainId: rChainId })
  const [poolNotFound, setPoolNotFound] = useState(false)

  const poolDataCacheOrApi = useMemo(() => poolData || poolDataCache, [poolData, poolDataCache])

  useEffect(() => {
    if (!rChainId || curveApi?.chainId !== rChainId || !haveAllPools || poolData) return
    fetchNewPool(curveApi, props.pool)
      .then((found) => setPoolNotFound(!found))
      .catch(() => setPoolNotFound(true))
  }, [curveApi, fetchNewPool, haveAllPools, network, props, poolData, push, rChainId])

  return !rFormType || network.excludePoolsMapper[rPoolId] || poolNotFound ? (
    <ErrorPage title="404" subtitle={t`Pool Not Found`} continueUrl={getPath(props, ROUTE.PAGE_POOLS)} />
  ) : (
    rFormType && poolDataCacheOrApi?.pool?.id === rPoolId && hasDepositAndStake != null && (
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
