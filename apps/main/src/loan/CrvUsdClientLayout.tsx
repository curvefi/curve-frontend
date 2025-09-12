import { networksIdMapper } from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import type { UrlParams } from '@/loan/types/loan.types'
import { Outlet } from '@tanstack/react-router'
import { useParams } from '@ui-kit/hooks/router'
import { useHydration } from '@ui-kit/hooks/useHydration'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'

export function CrvUsdClientLayout() {
  const { network: networkId = 'ethereum' } = useParams<Partial<UrlParams>>()
  const chainId = networksIdMapper[networkId]
  const hydrate = useStore((s) => s.hydrate)
  const isHydrated = useHydration('llamaApi', hydrate, chainId)

  useGasInfoAndUpdateLib({ chainId, networks })
  useRedirectToEth(networks[chainId], networkId, isHydrated)

  return isHydrated && <Outlet />
}
