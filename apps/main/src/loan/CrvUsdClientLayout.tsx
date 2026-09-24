import { useMemo } from 'react'
import { useGasInfoAndUpdateLib } from '@evm-ui/entities/gas-info'
import { useRedirectToEth } from '@evm-ui/hooks/useRedirectToEth'
import { Outlet } from '@tanstack/react-router'
import { useParams } from '@ui/hooks/router'
import { networksIdMapper } from './networks'
import type { UrlParams } from './types/loan.types'

export function CrvUsdClientLayout() {
  const { network: blockchainId = 'ethereum' } = useParams<Partial<UrlParams>>()
  const chainId = networksIdMapper[blockchainId]
  const supportedBlockchainIds = useMemo(() => Object.keys(networksIdMapper), [])

  useGasInfoAndUpdateLib({ chainId })
  useRedirectToEth(blockchainId, supportedBlockchainIds)

  return <Outlet />
}
