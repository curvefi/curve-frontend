import type { NextPage } from 'next'

import { Navigate, Route, Routes } from 'react-router'
import dynamic from 'next/dynamic'

import { ROUTE } from '@/constants'
import { getNetworkFromUrl } from '@/utils/utilsRouter'

const PageLlammasList = dynamic(() => import('@/components/PageMarketList/Page'), { ssr: false })
const PageLoanCreate = dynamic(() => import('@/components/PageLoanCreate/Page'), { ssr: false })
const PageLoanManage = dynamic(() => import('@/components/PageLoanManage/Page'), { ssr: false })
const PageVault = dynamic(() => import('@/components/PageVault/Page'), { ssr: false })
const PageRiskDisclaimer = dynamic(() => import('@/components/PageDisclaimer/Page'), { ssr: false })
const Page404 = dynamic(() => import('@/components/Page404/Page'), { ssr: false })
const PageIntegrations = dynamic(() => import('@/components/PageIntegrations/Page'), { ssr: false })

const App: NextPage = () => {
  const SubRoutes = (
    <>
      <Route
        path=":network"
        element={<Navigate to={`/${getNetworkFromUrl().rNetwork}${ROUTE.PAGE_MARKETS}`} replace />}
      />
      <Route path=":network/risk-disclaimer" element={<PageRiskDisclaimer />} />
      <Route path=":network/integrations" element={<PageIntegrations />} />
      <Route path=":network/markets" element={<PageLlammasList />} />
      <Route path=":network/markets/:owmId" element={<Navigate to="create" />} />
      <Route path=":network/markets/:owmId/create" element={<PageLoanCreate />} />
      <Route path=":network/markets/:owmId/create/:formType" element={<PageLoanCreate />} />
      <Route path=":network/markets/:owmId/manage" element={<PageLoanManage />} />
      <Route path=":network/markets/:owmId/manage/:formType" element={<PageLoanManage />} />
      <Route path=":network/markets/:owmId/vault" element={<PageVault />} />
      <Route path=":network/markets/:owmId/vault/:formType" element={<PageVault />} />
    </>
  )

  return (
    <Routes>
      {SubRoutes}
      <Route path=":locale">{SubRoutes}</Route>
      <Route path="/markets/*" element={<Navigate to={`/ethereum${ROUTE.PAGE_MARKETS}`} replace />} />
      <Route path="/risk-disclaimer" element={<Navigate to={`/ethereum${ROUTE.PAGE_RISK_DISCLAIMER}`} replace />} />
      <Route path="/integrations" element={<Navigate to={`/ethereum${ROUTE.PAGE_INTEGRATIONS}`} replace />} />
      <Route path="/" element={<Navigate to={`/ethereum/markets`} replace />} />
      <Route path="404" element={<Page404 />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  )
}

export default App
