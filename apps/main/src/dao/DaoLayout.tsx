import networks, { networksIdMapper } from '@/dao/networks'
import useStore from '@/dao/store/useStore'
import type { UrlParams } from '@/dao/types/dao.types'
import { Outlet } from '@tanstack/react-router'
import { useHydrationContext } from '@ui-kit/features/connect-wallet'
import { HydrationProvider } from '@ui-kit/features/connect-wallet/lib/HydrationProvider'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useParams } from '@ui-kit/hooks/router'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'

export function DaoLayout() {
  const { network = 'ethereum' } = useParams<Partial<UrlParams>>()
  const chainId = networksIdMapper[network]
  useRedirectToEth(networks[chainId], network)
  useGasInfoAndUpdateLib({ chainId, networks })
  return (
    <HydrationProvider libKey="curveApi" hydrate={useStore((s) => s.hydrate)} chainId={networksIdMapper[network]}>
      <DaoAutoRefresh />
      <Outlet />
    </HydrationProvider>
  )
}

export const DaoAutoRefresh = () => {
  const isHydrated = !!useHydrationContext('curveApi').api
  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const getGauges = useStore((state) => state.gauges.getGauges)
  const getGaugesData = useStore((state) => state.gauges.getGaugesData)
  usePageVisibleInterval(
    () => Promise.all([getGauges(), getGaugesData()]),
    REFRESH_INTERVAL['5m'],
    isPageVisible && isHydrated,
  )
  return null
}
