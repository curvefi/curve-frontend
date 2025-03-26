import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import type { DexServerSideNetworkCache } from '@/app/api/dex/types'
import { getServerData } from '@/background'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import { InjectServeSideData } from './InjectServeSideData'
import { getNetworkConfig } from './pools.util'

type NetworkLayoutProps = { params: Promise<NetworkUrlParams>; children: ReactNode }

const Layout = async ({ children, params }: NetworkLayoutProps) => {
  const [urlParams, httpHeaders] = await Promise.all([params, headers()])
  const network = await getNetworkConfig(urlParams.network)
  if (!network) {
    return notFound()
  }
  const cache = await getServerData<DexServerSideNetworkCache>(`dex/${network}`, httpHeaders)
  return (
    <InjectServeSideData chainId={network.chainId} {...cache}>
      {children}
    </InjectServeSideData>
  )
}

export default Layout
