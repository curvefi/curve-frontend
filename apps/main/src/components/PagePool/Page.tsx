import Box from '@/ui/Box'
import { t } from '@lingui/macro'
import type { NextPage } from 'next'

import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import ConnectWallet from '@/components/ConnectWallet'
import Transfer from '@/components/PagePool/index'
import { ROUTE } from '@/constants'
import usePageOnMount from '@/hooks/usePageOnMount'
import DocumentHead from '@/layout/default/DocumentHead'
import networks from '@/networks'
import useStore from '@/store/useStore'

import { scrollToTop } from '@/utils'
import { getPath } from '@/utils/utilsRouter'

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
  const hidePoolsMapper = rChainId ? networks[rChainId].customPoolIds : null
  const provider = useStore((state) => state.wallet.getProvider(''))

  const { hasDepositAndStake } = getNetworkConfigFromApi(rChainId)

  const poolDataCacheOrApi = useMemo(() => poolData || poolDataCache, [poolData, poolDataCache])

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
      <DocumentHead title={poolDataCacheOrApi?.pool?.name ?? 'Pool'} />
      {!provider ? (
        <Box display="flex" fillWidth>
          <ConnectWalletWrapper>
            <ConnectWallet
              description={t`Connect wallet to view pool`}
              connectText={t`Connect Wallet`}
              loadingText={t`Connecting`}
            />
          </ConnectWalletWrapper>
        </Box>
      ) : (
        rChainId &&
        rFormType &&
        rPoolId &&
        poolDataCacheOrApi?.pool?.id === rPoolId &&
        typeof hasDepositAndStake !== 'undefined' && (
          <Transfer
            curve={curve}
            params={params}
            poolData={poolData}
            poolDataCacheOrApi={poolDataCacheOrApi}
            routerParams={{ rChainId, rPoolId, rFormType }}
            hasDepositAndStake={hasDepositAndStake}
          />
        )
      )}
    </>
  )
}

const ConnectWalletWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  margin: var(--spacing-5) auto auto;
  padding: var(--spacing-4) var(--spacing-4);
  background: var(--page--background-color);
  background-color: var(--table--background-color);
`

export default Page
