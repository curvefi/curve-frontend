import type { NextPage } from 'next'

import dynamic from 'next/dynamic'
import { Navigate, Route, Routes } from 'react-router'

import { ROUTE } from '@/constants'

const PageMarketList = dynamic(() => import('@/components/PageMarketList/Page'), { ssr: false })
const PageLlamaMarkets = dynamic(() => import('@/components/PageLlamaMarkets/Page').then((p) => p.PageLlamaMarkets), {
  ssr: false,
})
const PageLoanCreate = dynamic(() => import('@/components/PageLoanCreate/Page'), { ssr: false })
const PageLoanManage = dynamic(() => import('@/components/PageLoanManage/Page'), { ssr: false })
const PageDisclaimer = dynamic(() => import('@/components/PageDisclaimer/Page'), { ssr: false })
const Page404 = dynamic(() => import('@/components/Page404/Page'), { ssr: false })
const PageIntegrations = dynamic(() => import('@/components/PageIntegrations/Page'), { ssr: false })
const PagePegKeepers = dynamic(() => import('@/components/PagePegKeepers/Page'), { ssr: false })
const PageCrvUsdStaking = dynamic(() => import('@/components/PageCrvUsdStaking/Page'), { ssr: false })

const App: NextPage = () => {
  const SubRoutes = (
    <>
      <Route path=":network" element={<PageMarketList />} />
      <Route path={`:network${ROUTE.PAGE_DISCLAIMER}`} element={<PageDisclaimer />} />
      <Route path={`:network${ROUTE.PAGE_INTEGRATIONS}`} element={<PageIntegrations />} />
      <Route path={`:network${ROUTE.PAGE_PEGKEEPERS}`} element={<PagePegKeepers />} />
      <Route path={`:network${ROUTE.PAGE_MARKETS}`} element={<PageMarketList />} />
      <Route path={`:network${ROUTE.BETA_PAGE_MARKETS}`} element={<PageLlamaMarkets />} />
      <Route path={`:network${ROUTE.PAGE_CRVUSD_STAKING}`} element={<PageCrvUsdStaking />} />
      <Route path={`:network${ROUTE.PAGE_MARKETS}/:collateralId`} element={<Navigate to="create" />} />
      <Route path={`:network${ROUTE.PAGE_MARKETS}/:collateralId/create`} element={<PageLoanCreate />} />
      <Route path={`:network${ROUTE.PAGE_MARKETS}/:collateralId/create/:formType`} element={<PageLoanCreate />} />
      <Route path={`:network${ROUTE.PAGE_MARKETS}/:collateralId/manage`} element={<Navigate to="create" />} />
      <Route path={`:network${ROUTE.PAGE_MARKETS}/:collateralId/manage/:formType`} element={<PageLoanManage />} />
    </>
  )

  return (
    <Routes>
      {SubRoutes}
      <Route path=":locale">{SubRoutes}</Route>
      <Route path={`${ROUTE.PAGE_MARKETS}/*`} element={<Navigate to={`/ethereum${ROUTE.PAGE_MARKETS}`} replace />} />
      <Route
        path={ROUTE.PAGE_CRVUSD_STAKING}
        element={<Navigate to={`/ethereum${ROUTE.PAGE_CRVUSD_STAKING}`} replace />}
      />
      <Route path={ROUTE.PAGE_DISCLAIMER} element={<Navigate to={`/ethereum${ROUTE.PAGE_DISCLAIMER}`} replace />} />
      <Route path={ROUTE.PAGE_PEGKEEPERS} element={<Navigate to={`/ethereum${ROUTE.PAGE_PEGKEEPERS}`} replace />} />
      <Route path={ROUTE.PAGE_INTEGRATIONS} element={<Navigate to={`/ethereum${ROUTE.PAGE_INTEGRATIONS}`} replace />} />
      <Route path="/" element={<Navigate to={`/ethereum${ROUTE.PAGE_MARKETS}`} replace />} />
      <Route path="404" element={<Page404 />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  )
}

export default App
