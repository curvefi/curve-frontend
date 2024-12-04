import dynamic from 'next/dynamic'
import { Navigate, Route, Routes } from 'react-router'

import { DEFAULT_NETWORK_CONFIG, ROUTE } from '@/constants'
import curve from '@curvefi/api'
import { getBaseNetworksConfig } from '@/ui/utils'
import { defaultNetworks } from '@/store/default-networks'
import useStore from '@/store/useStore'
import { useCallback, useEffect, useState } from 'react'
import { connectWalletLocales, initOnboard } from '@/common/features/connect-wallet'
import delay from 'lodash/delay'
import { getStorageValue, isMobile } from '@/utils'
import { getLocaleFromUrl } from '@/utils/utilsRouter'
import { dynamicActivate, initTranslation, updateAppLocale } from '@/lib/i18n'
import { i18n } from '@lingui/core'
import { ICurveLiteNetwork } from '@curvefi/api/lib/interfaces'
import Page from '@/layout/default'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'

const PageDashboard = dynamic(() => import('@/components/PageDashboard/Page'), { ssr: false })
const PageLockedCrv = dynamic(() => import('@/components/PageCrvLocker/Page'), { ssr: false })
const PagePoolTransfer = dynamic(() => import('@/components/PagePool/Page'), { ssr: false })
const PagePools = dynamic(() => import('@/components/PagePoolList/Page'), { ssr: false })
const PageSwap = dynamic(() => import('@/components/PageRouterSwap/Page'), { ssr: false })
const Page404 = dynamic(() => import('@/components/Page404/Page'), { ssr: false })
const PageCreatePool = dynamic(() => import('@/components/PageCreatePool/Page'), { ssr: false })
const PageDeployGauge = dynamic(() => import('@/components/PageDeployGauge/Page'), { ssr: false })
const PageIntegrations = dynamic(() => import('@/components/PageIntegrations/Page'), { ssr: false })
const PageCompensation = dynamic(() => import('@/components/PageCompensation/Page'), { ssr: false })
const PageRiskDisclaimer = dynamic(() => import('@/components/PageRiskDisclaimer/Page'), { ssr: false })

export const getServerSideProps = (async () => {
  const liteNetworks = await curve.getCurveLiteNetworks()
  const result = { props: { liteNetworks } }
  console.log(result)
  return result
}) satisfies GetServerSideProps<{ liteNetworks: ICurveLiteNetwork[] }>

const App = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { liteNetworks } = props
  console.log('index', props)

  const sliceState = useStore((state) => state.networks)
  const updateWalletStoreByKey = useStore((state) => state.wallet.setStateByKey)
  const setPageWidth = useStore((state) => state.setPageWidth)
  const updateShowScrollButton = useStore((state) => state.updateShowScrollButton)
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)
  const locale = useStore((state) => state.locale)
  const [appLoaded, setAppLoaded] = useState(false)

  const handleResizeListener = useCallback(() => {
    updateGlobalStoreByKey('isMobile', isMobile())
    if (window.innerWidth) setPageWidth(window.innerWidth)
  }, [setPageWidth, updateGlobalStoreByKey])

  useEffect(() => {
    const handleScrollListener = () => {
      updateShowScrollButton(window.scrollY)
    }

    const { themeType } = getStorageValue('APP_CACHE') ?? {}

    // init theme
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    updateGlobalStoreByKey('themeType', themeType ? themeType : darkModeQuery.matches ? 'dark' : 'default')

    // init locale
    const { rLocale } = getLocaleFromUrl()
    const parsedLocale = rLocale?.value ?? 'en'
    initTranslation(i18n, parsedLocale)
    dynamicActivate(parsedLocale)
    updateAppLocale(parsedLocale, updateGlobalStoreByKey)

    const networks: Networks = {
      ...defaultNetworks,
      ...Object.values(liteNetworks).reduce(
        (prev, { chainId, ...config }) => {
          prev[chainId] = {
            ...getBaseNetworksConfig(Number(chainId), config),
            ...DEFAULT_NETWORK_CONFIG,
            chainId,
            hasFactory: true,
            stableswapFactory: true,
            twocryptoFactory: true,
            tricryptoFactory: true,
            isLite: true,
          }
          return prev
        },
        {} as Record<number, NetworkConfig>,
      ),
    }

    sliceState.setStateByKey('networks', networks)
    sliceState.setNetworksIdMapper(networks)
    sliceState.setVisibleNetworksList(networks)

    // init onboard
    const onboardInstance = initOnboard(connectWalletLocales, locale, themeType, networks)
    updateWalletStoreByKey('onboard', onboardInstance)

    const handleVisibilityChange = () => {
      updateGlobalStoreByKey('isPageVisible', !document.hidden)
    }

    updateGlobalStoreByKey('loaded', true)
    handleResizeListener()
    handleVisibilityChange()

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('resize', () => handleResizeListener())
    window.addEventListener('scroll', () => delay(handleScrollListener, 200))
    setAppLoaded(true)
  }, [
    handleResizeListener,
    locale,
    liteNetworks,
    sliceState,
    updateGlobalStoreByKey,
    updateShowScrollButton,
    updateWalletStoreByKey,
  ])

  const SubRoutes = (
    <>
      <Route path=":network" element={<PageSwap />} />
      <Route path=":network/dashboard" element={<PageDashboard />} />
      <Route path=":network/locker" element={<PageLockedCrv />} />
      <Route path=":network/locker/:lockedCrvFormType" element={<PageLockedCrv />} />
      <Route path=":network/create-pool" element={<PageCreatePool />} />
      <Route path=":network/deploy-gauge" element={<PageDeployGauge />} />
      <Route path=":network/integrations" element={<PageIntegrations />} />
      <Route path=":network/pools" element={<PagePools />} />
      <Route path=":network/pools/:pool" element={<Navigate to="deposit" replace />} />
      <Route path=":network/pools/:pool/:transfer" element={<PagePoolTransfer />} />
      <Route path=":network/swap" element={<PageSwap />} />
      <Route path=":network/compensation" element={<PageCompensation />} />
      <Route path=":network/risk-disclaimer" element={<PageRiskDisclaimer />} />
    </>
  )

  return (
    appLoaded && (
      <Page>
        <Routes>
          {SubRoutes}
          <Route path=":locale">{SubRoutes}</Route>
          <Route path="/dashboard" element={<Navigate to={`/ethereum${ROUTE.PAGE_DASHBOARD}`} replace />} />
          <Route path="/deploy-gauge" element={<Navigate to={`/ethereum${ROUTE.PAGE_DEPLOY_GAUGE}`} replace />} />
          <Route path="/locker" element={<Navigate to={`/ethereum${ROUTE.PAGE_LOCKER}`} replace />} />
          <Route path="/create-pool" element={<Navigate to={`/ethereum${ROUTE.PAGE_CREATE_POOL}`} replace />} />
          <Route path="/integrations" element={<PageIntegrations />} />
          <Route path="/pools/*" element={<Navigate to={`/ethereum${ROUTE.PAGE_POOLS}`} replace />} />
          <Route path="/swap" element={<Navigate to={`/ethereum${ROUTE.PAGE_SWAP}`} replace />} />
          <Route path="/compensation" element={<Navigate to={`/ethereum${ROUTE.PAGE_COMPENSATION}`} replace />} />
          <Route path="/risk-disclaimer" element={<Navigate to={`/ethereum${ROUTE.PAGE_RISK_DISCLAIMER}`} replace />} />
          <Route path="/" element={<Navigate to={`/ethereum${ROUTE.PAGE_SWAP}`} />} />
          <Route path="404" element={<Page404 />} />
          <Route path="*" element={<Page404 />} />
        </Routes>
      </Page>
    )
  )
}

export default App
