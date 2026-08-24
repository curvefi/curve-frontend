import { LendMarketSubNavMobile } from '@/lend/components/LendMarketSubNavMobile'
import { networksIdMapper, networks } from '@/lend/networks'
import type { UrlParams } from '@/lend/types/lend.types'
import { useParams } from '@evm-ui/hooks/router'
import { useRedirectToEth } from '@evm-ui/hooks/useRedirectToEth'
import { useGasInfoAndUpdateLib } from '@evm-ui/lib/model/entities/gas-info'
import { Outlet } from '@tanstack/react-router'

export function LendLayout() {
  const { network: networkId = 'ethereum' } = useParams<Partial<UrlParams>>()
  const chainId = networksIdMapper[networkId]

  useRedirectToEth(networks[chainId], networkId)
  useGasInfoAndUpdateLib({ chainId, networks })

  return (
    <>
      <LendMarketSubNavMobile />
      <Outlet />
    </>
  )
}
