import { Address } from 'viem'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { Chain } from '@curvefi/prices-api'
import { useCrvUsdSnapshots } from '@ui-kit/entities/crvusd-snapshots'
import { useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import type { LlamaMarketTemplate } from 'main/src/llamalend/llamalend.types'

export function useLlamaSnapshot(
  market: LlamaMarketTemplate | undefined,
  blockchainId: Chain | undefined,
  enabled: boolean,
) {
  const isLendMarket = market instanceof LendMarketTemplate
  const controllerAddress = isLendMarket ? market?.addresses.controller : market?.controller
  const snapshotsEnabled = enabled && !!controllerAddress && !!blockchainId
  const lendingSnapshotsQuery = useLendingSnapshots(
    {
      blockchainId: blockchainId,
      contractAddress: controllerAddress as Address,
      agg: 'day',
      limit: 1,
    },
    snapshotsEnabled && isLendMarket,
  )
  const crvUsdSnapshotsQuery = useCrvUsdSnapshots(
    {
      blockchainId: blockchainId,
      contractAddress: controllerAddress as Address,
      agg: 'day',
      limit: 1,
    },
    snapshotsEnabled && !isLendMarket,
  )
  return isLendMarket ? lendingSnapshotsQuery : crvUsdSnapshotsQuery
}
