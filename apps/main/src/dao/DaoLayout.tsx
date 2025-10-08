import { useAutoRefresh } from '@/dao/hooks/useAutoRefresh'
import networks, { networksIdMapper } from '@/dao/networks'
import useStore from '@/dao/store/useStore'
import type { UrlParams } from '@/dao/types/dao.types'
import { Outlet } from '@tanstack/react-router'
import { useParams } from '@ui-kit/hooks/router'
import { useHydration } from '@ui-kit/hooks/useHydration'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'

export function DaoLayout() {
  const { network = 'ethereum' } = useParams<Partial<UrlParams>>()
  const hydrate = useStore((s) => s.hydrate)
  const chainId = networksIdMapper[network]
  const isHydrated = useHydration('curveApi', hydrate, chainId)

  useRedirectToEth(networks[chainId], network, isHydrated)
  useGasInfoAndUpdateLib({ chainId, networks })
  useAutoRefresh(isHydrated)

  return <Outlet />
}
