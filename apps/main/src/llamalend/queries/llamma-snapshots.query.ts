import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { type CrvUsdSnapshot, useCrvUsdSnapshots } from '@ui-kit/entities/crvusd-snapshots'
import { type LendingSnapshot, useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import type { SnapshotRange } from '@ui-kit/lib/model/query/time-option-validation'
import { MarketType } from '@ui-kit/types/market'
import type { Query } from '@ui-kit/types/util'

export function useLlamaSnapshot({
  blockchainId,
  enabled = true,
  range = { kind: 'timeRange', timeOption: '1M' },
  controllerAddress,
  marketType,
}: {
  blockchainId: Chain | undefined | null
  enabled?: boolean
  range?: SnapshotRange
  controllerAddress: Address | undefined
  marketType: MarketType
}): Query<LendingSnapshot[] | CrvUsdSnapshot[]> {
  const timeOption = range.kind === 'timeRange' ? range.timeOption : undefined
  const limit = range.kind === 'limit' ? range.limit : undefined
  return {
    Lend: useLendingSnapshots(
      { blockchainId, contractAddress: controllerAddress, timeOption, limit },
      enabled && marketType === MarketType.Lend,
    ),
    Mint: useCrvUsdSnapshots(
      { blockchainId, contractAddress: controllerAddress, timeOption, limit },
      enabled && marketType === MarketType.Mint,
    ),
  }[marketType]
}
