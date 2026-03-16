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
  limit: number = 1,
) {
  const isLendMarket = market instanceof LendMarketTemplate
  const controllerAddress = (isLendMarket ? market?.addresses.controller : market?.controller) as Address | undefined
  const lendingSnapshotsQuery = useLendingSnapshots(
    {
      blockchainId,
      contractAddress: controllerAddress,
      agg: 'day',
      limit,
    },
    enabled && isLendMarket,
  )
  const crvUsdSnapshotsQuery = useCrvUsdSnapshots(
    {
      blockchainId,
      contractAddress: controllerAddress,
      agg: 'day',
      limit,
    },
    enabled && !isLendMarket,
  )
  return isLendMarket ? lendingSnapshotsQuery : crvUsdSnapshotsQuery
}
