import { Outlet } from '@tanstack/react-router'
import { useParams } from '@ui-kit/hooks/router'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { networks, networksIdMapper } from './networks'
import type { UrlParams } from './types/loan.types'

export function CrvUsdClientLayout() {
  const { network: networkId = 'ethereum' } = useParams<Partial<UrlParams>>()
  const chainId = networksIdMapper[networkId]
  useGasInfoAndUpdateLib({ chainId, networks })
  useRedirectToEth(networks[chainId], networkId)
  return <Outlet />
}
