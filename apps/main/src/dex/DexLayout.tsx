import { useAutoRefresh } from '@/dex/hooks/useAutoRefresh'
import type { UrlParams } from '@/dex/types/main.types'
import { recordValues } from '@curvefi/primitives/objects.utils'
import { Outlet } from '@tanstack/react-router'
import { useParams } from '@ui-kit/hooks/router'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'
import { useNetworks } from './entities/networks'

export function DexLayout() {
  const { network: networkId = 'ethereum' } = useParams<Partial<UrlParams>>()
  const { data: networks } = useNetworks()
  const network = recordValues(networks).find((n) => n.id === networkId)

  useRedirectToEth(network, networkId)
  useAutoRefresh(network?.chainId)

  return <Outlet />
}
