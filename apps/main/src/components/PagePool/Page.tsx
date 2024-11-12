import type { NextPage } from 'next'
import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import { ROUTE } from '@/constants'
import { getPath } from '@/utils/utilsRouter'
import usePageOnMount from '@/hooks/usePageOnMount'
import useStore from '@/store/useStore'
import { scrollToTop } from '@/utils'
import DocumentHead from '@/layout/default/DocumentHead'
import Transfer from '@/components/PagePool/index'
import ConnectWallet from '@/components/ConnectWallet'
import Box from '@/ui/Box'

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
  const provider = useStore((state) => state.wallet.getProvider(''))
  const { excludePoolsMapper } = useStore((state) => state.networks.networks[rChainId])

  const { hasDepositAndStake } = getNetworkConfigFromApi(rChainId)

  const poolDataCacheOrApi = useMemo(() => poolData || poolDataCache, [poolData, poolDataCache])

  useEffect(() => {
    scrollToTop()
  }, [])

  useEffect(() => {
    if (!rChainId) return

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
  }, [curve, curve?.chainId, excludePoolsMapper, fetchNewPool, haveAllPools, isLoadingApi, navigate, pageLoaded, params, poolData, rChainId, rFormType, rPoolId])

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
