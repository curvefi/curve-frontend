'use client'
import '@/global-extensions'
import { useParams } from 'next/navigation'
import { type ReactNode } from 'react'
import Page from '@/lend/layout'
import networks, { networksIdMapper } from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import type { UrlParams } from '@/lend/types/lend.types'
import { useHydration } from '@ui-kit/hooks/useHydration'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'

export const App = ({ children }: { children: ReactNode }) => {
  const { network: networkId = 'ethereum' } = useParams() as Partial<UrlParams> // network absent only in root
  const chainId = networksIdMapper[networkId]
  const hydrate = useStore((s) => s.hydrate)
  const isHydrated = useHydration('llamaApi', hydrate, chainId)
  useRedirectToEth(networks[chainId], networkId, isHydrated)
  return <Page>{isHydrated && children}</Page>
}
