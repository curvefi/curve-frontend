import { networksIdMapper, networks } from '@/dao/networks'
import type { UrlParams } from '@/dao/types/dao.types'
import { Outlet } from '@tanstack/react-router'
import { useParams } from '@ui-kit/hooks/router'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'

export function DaoLayout() {
  const { network = 'ethereum' } = useParams<Partial<UrlParams>>()
  const chainId = networksIdMapper[network]

  useRedirectToEth(networks[chainId], network)
  useGasInfoAndUpdateLib({ chainId, networks })

  return <Outlet />
}
