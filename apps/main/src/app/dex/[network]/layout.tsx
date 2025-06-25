import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import type { DexServerSideNetworkCache } from '@/app/api/dex/types'
import { getServerData } from '@/background'
import { getNetworkDef } from '@/dex/lib/networks'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import { InjectServeSideData } from './InjectServeSideData'

type NetworkLayoutProps = { params: Promise<NetworkUrlParams>; children: ReactNode }

const Layout = async ({ children, params }: NetworkLayoutProps) => {
  const [urlParams, httpHeaders] = await Promise.all([params, headers()])
  const network = await getNetworkDef(urlParams)
  if (!network) {
    return notFound()
  }
  const cache = await getServerData<DexServerSideNetworkCache>(`dex/${network.id}`, httpHeaders)
  return (
    <InjectServeSideData chainId={network.chainId} {...cache}>
      {children}
    </InjectServeSideData>
  )
}

export default Layout
