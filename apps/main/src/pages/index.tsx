import type { NextPage } from 'next'

import dynamic from 'next/dynamic'
import { Navigate, Route, Routes } from 'react-router'

import { ROUTE } from '@/dex/constants'

const PageDashboard = dynamic(() => import('@/dex/components/PageDashboard/Page'), { ssr: false })
const PageLockedCrv = dynamic(() => import('@/dex/components/PageCrvLocker/Page'), { ssr: false })
const PagePoolTransfer = dynamic(() => import('@/dex/components/PagePool/Page'), { ssr: false })
const PagePools = dynamic(() => import('@/dex/components/PagePoolList/Page'), { ssr: false })
const PageSwap = dynamic(() => import('@/dex/components/PageRouterSwap/Page'), { ssr: false })
const Page404 = dynamic(() => import('@/dex/components/Page404/Page'), { ssr: false })
const PageCreatePool = dynamic(() => import('@/dex/components/PageCreatePool/Page'), { ssr: false })
const PageDeployGauge = dynamic(() => import('@/dex/components/PageDeployGauge/Page'), { ssr: false })
const PageIntegrations = dynamic(() => import('@/dex/components/PageIntegrations/Page'), { ssr: false })
const PageCompensation = dynamic(() => import('@/dex/components/PageCompensation/Page'), { ssr: false })
const PageDisclaimer = dynamic(() => import('@/dex/components/PageDisclaimer/Page'), { ssr: false })

const App: NextPage = () => {
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
      <Route path=":network/disclaimer" element={<PageDisclaimer />} />
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
      <Route path="/integrations" element={<PageIntegrations />} />
      <Route path="/pools/*" element={<Navigate to={`/ethereum${ROUTE.PAGE_POOLS}`} replace />} />
      <Route path="/swap" element={<Navigate to={`/ethereum${ROUTE.PAGE_SWAP}`} replace />} />
      <Route path="/compensation" element={<Navigate to={`/ethereum${ROUTE.PAGE_COMPENSATION}`} replace />} />
      <Route path="/disclaimer" element={<Navigate to={`/ethereum${ROUTE.PAGE_DISCLAIMER}`} replace />} />
      <Route path="/" element={<Navigate to={`/ethereum${ROUTE.PAGE_SWAP}`} />} />
      <Route path="404" element={<Page404 />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  )
}

export default App
