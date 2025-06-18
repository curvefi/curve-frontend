'use client'
import '@/global-extensions'
import { useParams } from 'next/navigation'
import { type ReactNode, useEffect, useState } from 'react'
import Page from '@/dex/layout/default'
import useStore from '@/dex/store/useStore'
import { type ChainId, type UrlParams } from '@/dex/types/main.types'
import { recordValues } from '@curvefi/prices-api/objects.util'
import type { NetworkDef } from '@ui/utils'
import { useHydration } from '@ui-kit/hooks/useHydration'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'

export const App = ({ children, networks }: { children: ReactNode; networks: Record<ChainId, NetworkDef> }) => {
  const { network: networkId = 'ethereum' } = useParams() as Partial<UrlParams> // network absent only in root
  const [appLoaded, setAppLoaded] = useState(false)
  const fetchNetworks = useStore((state) => state.networks.fetchNetworks)
  const hydrate = useStore((s) => s.hydrate)

  const network = recordValues(networks).find((n) => n.id === networkId)!
  const isHydrated = useHydration('curveApi', hydrate, network.chainId)
  useRedirectToEth(network, networkId, isHydrated)

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

  return <Page network={network}>{appLoaded && isHydrated && children}</Page>
}
