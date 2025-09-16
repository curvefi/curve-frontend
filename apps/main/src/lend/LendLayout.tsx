import networks, { networksIdMapper } from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import type { UrlParams } from '@/lend/types/lend.types'
import { Outlet } from '@tanstack/react-router'
import { useParams } from '@ui-kit/hooks/router'
import { useHydration } from '@ui-kit/hooks/useHydration'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'

export function LendLayout() {
  const { network: networkId = 'ethereum' } = useParams<Partial<UrlParams>>()
  const chainId = networksIdMapper[networkId]
  const hydrate = useStore((s) => s.hydrate)
  const isHydrated = useHydration('llamaApi', hydrate, chainId)

  useRedirectToEth(networks[chainId], networkId, isHydrated)
  useGasInfoAndUpdateLib({ chainId, networks })

  return isHydrated && <Outlet />
}
