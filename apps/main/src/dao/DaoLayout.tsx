import { useAutoRefresh } from '@/dao/hooks/useAutoRefresh'
import networks, { networksIdMapper } from '@/dao/networks'
import type { UrlParams } from '@/dao/types/dao.types'
import { Outlet } from '@tanstack/react-router'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { useParams } from '@ui-kit/hooks/router'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'

export function DaoLayout() {
  const { network = 'ethereum' } = useParams<Partial<UrlParams>>()
  const chainId = networksIdMapper[network]
  const { isHydrated } = useConnection()

  useRedirectToEth(networks[chainId], network)
  useGasInfoAndUpdateLib({ chainId, networks })
  useAutoRefresh(isHydrated)

  return <Outlet />
}
