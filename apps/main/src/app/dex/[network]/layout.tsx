import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import { InjectServeSideData } from './InjectServeSideData'
import { getNetworkConfig, getServerSideCache } from './pools.util'

type NetworkLayoutProps = { params: Promise<NetworkUrlParams>; children: ReactNode }

const Layout = async ({ children, params }: NetworkLayoutProps) => {
  const urlParams = await params
  const network = await getNetworkConfig(urlParams.network)
  if (!network) {
    return notFound()
  }
  return (
    <InjectServeSideData chainId={network.chainId} {...await getServerSideCache(network)}>
      {children}
    </InjectServeSideData>
  )
}

export default Layout
