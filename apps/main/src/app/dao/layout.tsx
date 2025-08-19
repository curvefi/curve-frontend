'use client'
import '@/global-extensions'
import { type ReactNode } from 'react'
import networks, { networksIdMapper } from '@/dao/networks'
import useStore from '@/dao/store/useStore'
import { type UrlParams } from '@/dao/types/dao.types'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useParams } from '@ui-kit/hooks/router'
import { useHydration } from '@ui-kit/hooks/useHydration'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'

const useAutoRefresh = (isHydrated: boolean) => {
  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const getGauges = useStore((state) => state.gauges.getGauges)
  const getGaugesData = useStore((state) => state.gauges.getGaugesData)
  usePageVisibleInterval(
    () => Promise.all([getGauges(), getGaugesData()]),
    REFRESH_INTERVAL['5m'],
    isPageVisible && isHydrated,
  )
}

export default function DaoLayout({ children }: { children: ReactNode }) {
  const { network = 'ethereum' } = useParams() as Partial<UrlParams> // network absent only in root
  const hydrate = useStore((s) => s.hydrate)
  const chainId = networksIdMapper[network]
  const isHydrated = useHydration('curveApi', hydrate, chainId)

  useRedirectToEth(networks[chainId], network, isHydrated)
  useGasInfoAndUpdateLib({ chainId, networks }) // Refresh gas info on a regular interval, relies on a side-effect
  useAutoRefresh(isHydrated)

  return children
}
