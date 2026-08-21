import { networksIdMapper, networks } from '@/dao/networks'
import type { UrlParams } from '@/dao/types/dao.types'
import { useParams } from '@evm-ui/hooks/router'
import { useRedirectToEth } from '@evm-ui/hooks/useRedirectToEth'
import { useGasInfoAndUpdateLib } from '@evm-ui/lib/model/entities/gas-info'
import { Outlet } from '@tanstack/react-router'

export function DaoLayout() {
  const { network = 'ethereum' } = useParams<Partial<UrlParams>>()
  const chainId = networksIdMapper[network]

  useRedirectToEth(networks[chainId], network)
  useGasInfoAndUpdateLib({ chainId, networks })

  return <Outlet />
}
