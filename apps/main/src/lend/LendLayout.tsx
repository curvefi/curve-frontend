import { networksIdMapper, networks } from '@/lend/networks'
import type { UrlParams } from '@/lend/types/lend.types'
import { Outlet } from '@tanstack/react-router'
import { useParams } from '@ui-kit/hooks/router'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'

export function LendLayout() {
  const { network: networkId = 'ethereum' } = useParams<Partial<UrlParams>>()
  const chainId = networksIdMapper[networkId]

  useRedirectToEth(networks[chainId], networkId)
  useGasInfoAndUpdateLib({ chainId, networks })

  return <Outlet />
}
