import { use } from 'react'
import { useAutoRefresh } from '@/dex/hooks/useAutoRefresh'
import { getNetworkDefs } from '@/dex/lib/networks'
import type { UrlParams } from '@/dex/types/main.types'
import { recordValues } from '@curvefi/prices-api/objects.util'
import { Outlet } from '@tanstack/react-router'
import { useParams } from '@ui-kit/hooks/router'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'

export function DexLayout() {
  const networks = use(getNetworkDefs())
  const { network: networkId = 'ethereum' } = useParams<Partial<UrlParams>>()
  const network = recordValues(networks).find((n) => n.id === networkId)!

  useRedirectToEth(network, networkId)
  useAutoRefresh(network)

  return <Outlet />
}
