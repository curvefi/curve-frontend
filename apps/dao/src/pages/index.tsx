import type { NextPage } from 'next'

import { Navigate, Route, Routes } from 'react-router'
import { ROUTE } from '@/constants'
import dynamic from 'next/dynamic'

const Page404 = dynamic(() => import('@/components/Page404/Page'), { ssr: false })
const PageDao = dynamic(() => import('@/components/PageProposals/Page'), { ssr: false })
const PageProposal = dynamic(() => import('@/components/PageProposal/Page'), { ssr: false })
const PageGauges = dynamic(() => import('@/components/PageGauges/Page'), { ssr: false })

const App: NextPage = (pageProps) => {
  const SubRoutes = (
    <>
      <Route path=":network/" element={<PageDao />} />
      <Route path=":network/proposals" element={<PageDao />} />
      <Route path=":network/proposals/:proposalId" element={<PageProposal />} />
      <Route path=":network/gauges" element={<PageGauges />} />
    </>
  )

  return (
    <Routes>
      {SubRoutes}
      <Route path=":locale">{SubRoutes}</Route>
      <Route path="/" element={<Navigate to={`/ethereum${ROUTE.PAGE_PROPOSALS}`} replace />} />
      <Route path="/proposals/*" element={<Navigate to={`/ethereum${ROUTE.PAGE_PROPOSALS}`} replace />} />
      <Route path="/gauges/*" element={<Navigate to={`/ethereum${ROUTE.PAGE_GAUGES}`} replace />} />
      <Route path="404" element={<Page404 />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  )
}

export default App
