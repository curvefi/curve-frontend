import type { NextPage } from 'next'

import { Navigate, Route, Routes } from 'react-router'
import { ROUTE } from '@/constants'
import dynamic from 'next/dynamic'

const PageIndex = dynamic(() => import('@/components/PageIndex'), { ssr: false })
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

const App: NextPage<PageProps> = (pageProps) => {
  const SubRoutes = (
    <>
      <Route path=":network/dashboard" element={<PageDashboard {...pageProps} />} />
      <Route path=":network/create-pool" element={<PageCreatePool {...pageProps} />} />
      <Route path=":network/locker" element={<PageLockedCrv {...pageProps} />} />
      <Route path=":network/locker/:lockedCrvFormType" element={<PageLockedCrv {...pageProps} />} />
      <Route path=":network/create-pool" element={<PageCreatePool {...pageProps} />} />
      <Route path=":network/deploy-gauge" element={<PageDeployGauge {...pageProps} />} />
      <Route path=":network/integrations" element={<PageIntegrations {...pageProps} />} />
      <Route path=":network/pools" element={<PagePools {...pageProps} />} />
      <Route path=":network/pools/:pool" element={<Navigate to="deposit" replace />} />
      <Route path=":network/pools/:pool/:transfer" element={<PagePoolTransfer {...pageProps} />} />
      <Route path=":network/swap" element={<PageSwap {...pageProps} />} />
      <Route path=":network/compensation" element={<PageCompensation {...pageProps} />} />
    </>
  )

  return (
    <Routes>
      {SubRoutes}
      <Route path=":locale">{SubRoutes}</Route>
      <Route path="/dashboard" element={<Navigate to={`/ethereum${ROUTE.PAGE_DASHBOARD}`} replace />} />
      <Route path="/deploy-gauge" element={<Navigate to={`/ethereum${ROUTE.PAGE_DEPLOY_GAUGE}`} replace />} />
      <Route path="/locker" element={<Navigate to={`/ethereum${ROUTE.PAGE_LOCKER}`} replace />} />
      <Route path="/create-pool" element={<Navigate to={`/ethereum${ROUTE.PAGE_CREATE_POOL}`} replace />} />
      <Route path="/integrations" element={<PageIntegrations {...pageProps} />} />
      <Route path="/pools/*" element={<Navigate to={`/ethereum${ROUTE.PAGE_POOLS}`} replace />} />
      <Route path="/swap" element={<Navigate to={`/ethereum${ROUTE.PAGE_SWAP}`} replace />} />
      <Route path="/compensation" element={<Navigate to={`/ethereum${ROUTE.PAGE_COMPENSATION}`} replace />} />
      <Route path="/" element={<PageIndex {...pageProps} />} />
      <Route path="404" element={<Page404 {...pageProps} />} />
      <Route path="*" element={<Page404 {...pageProps} />} />
    </Routes>
  )
}

export default App
