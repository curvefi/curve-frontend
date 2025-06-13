'use client'
import '@/global-extensions'
import { useParams } from 'next/navigation'
import { type ReactNode } from 'react'
import { BaseLayout } from '@/dao/layout'
import networks, { networksIdMapper } from '@/dao/networks'
import useStore from '@/dao/store/useStore'
import { type UrlParams } from '@/dao/types/dao.types'
import { useHydration } from '@ui-kit/hooks/useHydration'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'

export const App = ({ children }: { children: ReactNode }) => {
  const { network = 'ethereum' } = useParams() as Partial<UrlParams> // network absent only in root
  const hydrate = useStore((s) => s.hydrate)
  const chainId = networksIdMapper[network]
  const hydrated = useHydration('curveApi', hydrate, chainId)
  useRedirectToEth(networks[chainId], network)
  return (
    hydrated && (
      <BaseLayout networkId={network} chainId={chainId}>
        {children}
      </BaseLayout>
    )
  )
}
