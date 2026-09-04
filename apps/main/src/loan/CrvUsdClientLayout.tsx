import { useParams } from '@evm-ui/hooks/router'
import { useRedirectToEth } from '@evm-ui/hooks/useRedirectToEth'
import { useGasInfoAndUpdateLib } from '@evm-ui/lib/model/entities/gas-info'
import { Outlet } from '@tanstack/react-router'
import { networks, networksIdMapper } from './networks'
import type { UrlParams } from './types/loan.types'

export function CrvUsdClientLayout() {
  const { network: blockchainId = 'ethereum' } = useParams<Partial<UrlParams>>()
  const chainId = networksIdMapper[blockchainId]
  useGasInfoAndUpdateLib({ chainId })
  useRedirectToEth(networks[chainId], blockchainId)
  return <Outlet />
}
