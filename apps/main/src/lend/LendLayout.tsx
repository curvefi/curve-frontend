import networks, { networksIdMapper } from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import type { UrlParams } from '@/lend/types/lend.types'
import { Outlet } from '@tanstack/react-router'
import { HydrationProvider } from '@ui-kit/features/connect-wallet/lib/HydrationProvider'
import { useParams } from '@ui-kit/hooks/router'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'

export function LendLayout() {
  const { network: networkId = 'ethereum' } = useParams<Partial<UrlParams>>()
  const chainId = networksIdMapper[networkId]
  const hydrate = useStore((s) => s.hydrate)
  useRedirectToEth(networks[chainId], networkId)
  useGasInfoAndUpdateLib({ chainId, networks })
  return (
    <HydrationProvider hydrate={hydrate} libKey="llamaApi" chainId={chainId}>
      <Outlet />
    </HydrationProvider>
  )
}
