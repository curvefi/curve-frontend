import { use } from 'react'
import { useAutoRefresh } from '@/dex/hooks/useAutoRefresh'
import { useFetchNetworks } from '@/dex/hooks/useFetchNetworks'
import { getNetworkDefs } from '@/dex/lib/networks'
import useStore from '@/dex/store/useStore'
import type { UrlParams } from '@/dex/types/main.types'
import { recordValues } from '@curvefi/prices-api/objects.util'
import { Outlet } from '@tanstack/react-router'
import { useParams } from '@ui-kit/hooks/router'
import { useHydration } from '@ui-kit/hooks/useHydration'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'

export function DexLayout() {
  const networks = use(getNetworkDefs())
  const { network: networkId = 'ethereum' } = useParams<Partial<UrlParams>>()
  const isFetched = useFetchNetworks()
  const hydrate = useStore((s) => s.hydrate)
  const network = recordValues(networks).find((n) => n.id === networkId)!
  const isHydrated = useHydration('curveApi', hydrate, network.chainId)

  useRedirectToEth(network, networkId, isHydrated)
  useAutoRefresh(network)

  return isFetched && <Outlet />
}
