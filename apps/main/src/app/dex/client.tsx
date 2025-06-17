'use client'
import '@/global-extensions'
import { useParams } from 'next/navigation'
import { type ReactNode, useEffect, useState } from 'react'
import Page from '@/dex/layout/default'
import useStore from '@/dex/store/useStore'
import { type UrlParams } from '@/dex/types/main.types'
import { useHydration } from '@ui-kit/hooks/useHydration'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'

export const App = ({ children }: { children: ReactNode }) => {
  const { network: networkId = 'ethereum' } = useParams() as Partial<UrlParams> // network absent only in root
  const [appLoaded, setAppLoaded] = useState(false)
  const fetchNetworks = useStore((state) => state.networks.fetchNetworks)
  const networks = useStore((state) => state.networks.networks)
  const networksIdMapper = useStore((state) => state.networks.networksIdMapper)
  const hydrate = useStore((s) => s.hydrate)

  const chainId = networksIdMapper[networkId]
  const network = networks[chainId]
  const hydrated = useHydration('curveApi', hydrate, chainId)
  useRedirectToEth(networks[chainId], networkId)

  useEffect(() => {
    const abort = new AbortController()
    void (async () => {
      try {
        await fetchNetworks()
      } finally {
        if (!abort.signal.aborted) {
          setAppLoaded(true)
        }
      }
    })()
    return () => {
      setAppLoaded(false)
      abort.abort()
    }
  }, [fetchNetworks])

  return <Page network={network}>{appLoaded && hydrated && children}</Page>
}
