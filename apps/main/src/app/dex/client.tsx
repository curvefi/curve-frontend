'use client'
import '@/global-extensions'
import { useParams } from 'next/navigation'
import { type ReactNode, useEffect } from 'react'
import Page from '@/dex/layout/default'
import useStore from '@/dex/store/useStore'
import { type ChainId, type NetworkConfig, type UrlParams } from '@/dex/types/main.types'
import { useHydration } from '@ui-kit/features/connect-wallet'

export const App = ({ children, networks }: { children: ReactNode; networks: Record<ChainId, NetworkConfig> }) => {
  const { network: networkId = 'ethereum' } = useParams() as Partial<UrlParams> // network absent only in root
  const setNetworks = useStore((state) => state.networks.setNetworks)
  const networksIdMapper = useStore((state) => state.networks.networksIdMapper)
  const hydrate = useStore((s) => s.hydrate)
  const hydrated = useHydration('curveApi', hydrate)

  const chainId = networksIdMapper[networkId]
  const network = networks[chainId]

  useEffect(() => setNetworks(networks), [networks, setNetworks])

  return hydrated && <Page network={network}>{children}</Page>
}
