import { useAutoRefresh } from '@/dao/hooks/useAutoRefresh'
import { networksIdMapper, networks } from '@/dao/networks'
import type { UrlParams } from '@/dao/types/dao.types'
import { Outlet } from '@tanstack/react-router'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useParams } from '@ui-kit/hooks/router'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'

export function DaoLayout() {
  const { network = 'ethereum' } = useParams<Partial<UrlParams>>()
  const chainId = networksIdMapper[network]
  const { isHydrated } = useCurve()

  useRedirectToEth(networks[chainId], network)
  useGasInfoAndUpdateLib({ chainId, networks })
  useAutoRefresh(isHydrated)

  return <Outlet />
}
