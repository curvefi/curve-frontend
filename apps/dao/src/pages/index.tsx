import type { NextPage } from 'next'

import { Navigate, Route, Routes } from 'react-router'
import { ROUTE } from '@/constants'
import dynamic from 'next/dynamic'

const Page404 = dynamic(() => import('@/components/Page404/Page'), { ssr: false })
const PageDao = dynamic(() => import('@/components/PageDao/Page'), { ssr: false })

const App: NextPage = (pageProps) => {
  const SubRoutes = (
    <>
      <Route path=":network/" element={<PageDao {...pageProps} />} />
    </>
  )

  return (
    <Routes>
      {SubRoutes}
      <Route path=":locale">{SubRoutes}</Route>
      <Route path="/" element={<Navigate to={`/ethereum${ROUTE.PAGE_DAO}`} replace />} />
      <Route path="404" element={<Page404 />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  )
}

export default App
