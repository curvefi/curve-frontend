import { useMemo } from 'react'
import { useAutoRefresh } from '@/dex/hooks/useAutoRefresh'
import type { UrlParams } from '@/dex/types/main.types'
import { useParams } from '@evm-ui/hooks/router'
import { useRedirectToEth } from '@evm-ui/hooks/useRedirectToEth'
import { recordValues } from '@primitives/objects.utils'
import { Outlet } from '@tanstack/react-router'
import { useNetworks } from './entities/networks'

export function DexLayout() {
  const { network: blockchainId = 'ethereum' } = useParams<Partial<UrlParams>>()
  const { data: networks } = useNetworks()
  const network = recordValues(networks).find(n => n.blockchainId === blockchainId)
  const supportedBlockchainIds = useMemo(() => recordValues(networks).map(network => network.blockchainId), [networks])

  useRedirectToEth(blockchainId, supportedBlockchainIds)
  useAutoRefresh(network?.chainId)

  return <Outlet />
}
