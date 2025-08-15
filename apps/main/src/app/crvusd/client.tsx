'use client'
import '@/global-extensions'
import { type ReactNode } from 'react'
import { networks, networksIdMapper } from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import type { UrlParams } from '@/loan/types/loan.types'
import { useParams } from '@ui-kit/hooks/router'
import { useHydration } from '@ui-kit/hooks/useHydration'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'

export function CrvUsdClientLayout({ children }: { children: ReactNode }) {
  const { network: networkId = 'ethereum' } = useParams() as Partial<UrlParams> // network absent only in root
  const chainId = networksIdMapper[networkId]
  const hydrate = useStore((s) => s.hydrate)
  const isHydrated = useHydration('llamaApi', hydrate, chainId)

  useGasInfoAndUpdateLib({ chainId, networks }) // Refresh gas info on a regular interval, relies on a side-effect
  useRedirectToEth(networks[chainId], networkId, isHydrated)

  return isHydrated && children
}
