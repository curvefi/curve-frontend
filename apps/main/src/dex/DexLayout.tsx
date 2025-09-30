import { use } from 'react'
import { useAutoRefresh } from '@/dex/hooks/useAutoRefresh'
import { useFetchNetworks } from '@/dex/hooks/useFetchNetworks'
import { getNetworkDefs } from '@/dex/lib/networks'
import useStore from '@/dex/store/useStore'
import { UrlParams } from '@/dex/types/main.types'
import { recordValues } from '@curvefi/prices-api/objects.util'
import { Outlet } from '@tanstack/react-router'
import { HydrationProvider } from '@ui-kit/features/connect-wallet/lib/HydrationProvider'
import { useParams } from '@ui-kit/hooks/router'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'

export function DexLayout() {
  const networks = use(getNetworkDefs())
  const { network: networkId = 'ethereum' } = useParams<Partial<UrlParams>>()
  const isFetched = useFetchNetworks()
  const network = recordValues(networks).find((n) => n.id === networkId)!

  useRedirectToEth(network, networkId)
  useAutoRefresh(network)

  return (
    <HydrationProvider libKey="curveApi" chainId={network?.chainId} hydrate={useStore((s) => s.hydrate)}>
      {isFetched && <Outlet />}
    </HydrationProvider>
  )
}
