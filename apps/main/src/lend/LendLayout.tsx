import { useMemo } from 'react'
import { LendMarketSubNavMobile } from '@/lend/components/LendMarketSubNavMobile'
import { networksIdMapper } from '@/lend/networks'
import type { UrlParams } from '@/lend/types/lend.types'
import { useRedirectToEth } from '@evm-ui/hooks/useRedirectToEth'
import { useGasInfoAndUpdateLib } from '@evm-ui/lib/model/entities/gas-info'
import { Outlet } from '@tanstack/react-router'
import { useParams } from '@ui/hooks/router'

export function LendLayout() {
  const { network: blockchainId = 'ethereum' } = useParams<Partial<UrlParams>>()
  const chainId = networksIdMapper[blockchainId]
  const supportedBlockchainIds = useMemo(() => Object.keys(networksIdMapper), [])

  useRedirectToEth(blockchainId, supportedBlockchainIds)
  useGasInfoAndUpdateLib({ chainId })

  return (
    <>
      <LendMarketSubNavMobile />
      <Outlet />
    </>
  )
}
