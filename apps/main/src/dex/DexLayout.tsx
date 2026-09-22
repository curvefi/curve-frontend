import { useMemo } from 'react'
import type { UrlParams } from '@/dex/types/main.types'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { useRedirectToEth } from '@evm-ui/hooks/useRedirectToEth'
import { useGasInfoAndUpdateLib } from '@evm-ui/lib/model/entities/gas-info'
import { recordValues } from '@primitives/objects.utils'
import { Outlet } from '@tanstack/react-router'
import { useParams } from '@ui/hooks/router'
import { usePageVisibleInterval } from '@ui/hooks/usePageVisibleInterval'
import { REFRESH_INTERVAL } from '@ui/lib/time'
import { useNetworks } from './entities/networks'
import { fetchPools } from './lib/curvejs'

export function DexLayout() {
  const { network: blockchainId = 'ethereum' } = useParams<Partial<UrlParams>>()
  const { data: networks } = useNetworks()
  const { curveApi } = useCurve()
  const network = recordValues(networks).find(n => n.blockchainId === blockchainId)
  const supportedBlockchainIds = useMemo(() => recordValues(networks).map(network => network.blockchainId), [networks])

  useRedirectToEth(blockchainId, supportedBlockchainIds)

  useGasInfoAndUpdateLib({ chainId: network?.chainId })
  usePageVisibleInterval(() => void (curveApi && fetchPools(curveApi)), REFRESH_INTERVAL['15m'])

  return <Outlet />
}
