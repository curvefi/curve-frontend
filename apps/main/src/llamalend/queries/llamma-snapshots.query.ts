import { Address } from 'viem'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { Chain } from '@curvefi/prices-api'
import { useCrvUsdSnapshots } from '@ui-kit/entities/crvusd-snapshots'
import { useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import type { SnapshotRange } from '@ui-kit/lib/model/query/time-option-validation'
import type { LlamaMarketTemplate } from 'main/src/llamalend/llamalend.types'

export function useLlamaSnapshot(
  market: LlamaMarketTemplate | undefined | null,
  blockchainId: Chain | undefined | null,
  enabled: boolean,
  range: SnapshotRange = { kind: 'timeRange', timeOption: '1M' },
) {
  const isLendMarket = market instanceof LendMarketTemplate
  const controllerAddress = (isLendMarket ? market?.addresses.controller : market?.controller) as Address | undefined
  const timeOption = range.kind === 'timeRange' ? range.timeOption : undefined
  const limit = range.kind === 'limit' ? range.limit : undefined
  const lendingSnapshotsQuery = useLendingSnapshots(
    {
      blockchainId,
      contractAddress: controllerAddress,
      timeOption,
      limit,
    },
    enabled && isLendMarket,
  )
  const crvUsdSnapshotsQuery = useCrvUsdSnapshots(
    {
      blockchainId,
      contractAddress: controllerAddress,
      timeOption,
      limit,
    },
    enabled && !isLendMarket,
  )
  return isLendMarket ? lendingSnapshotsQuery : crvUsdSnapshotsQuery
}
