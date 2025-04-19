import type { ReactNode } from 'react'
import type { NetworkUrlParams } from '@/dao/types/dao.types'
import { App } from './client'

const Layout = async ({ params, children }: { params: Promise<NetworkUrlParams>; children: ReactNode }) => (
  <App {...await params}>{children}</App>
)

export default Layout
