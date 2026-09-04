import type { Chain } from '@curvefi/prices-api'
import { type CrvUsdSnapshot, useCrvUsdSnapshots } from '@evm-ui/entities/crvusd-snapshots'
import { type LendingSnapshot, useLendingSnapshots } from '@evm-ui/entities/lending-snapshots'
import type { SnapshotRange } from '@evm-ui/lib/model/query/time-option-validation'
import { MarketType } from '@evm-ui/types/market'
import type { Address } from '@primitives/address.utils'
import type { Query } from '@ui/features/queries/util'

type SnapshotByMarketType = {
  [MarketType.Lend]: LendingSnapshot
  [MarketType.Mint]: CrvUsdSnapshot
}

type SnapshotsByMarketType<TMarketType extends MarketType> = TMarketType extends MarketType
  ? SnapshotByMarketType[TMarketType][]
  : never

export function useMarketSnapshots<TMarketType extends MarketType>({
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
  marketType: TMarketType
}): Query<SnapshotsByMarketType<TMarketType>> {
  const timeOption = range.kind === 'timeRange' ? range.timeOption : undefined
  const limit = range.kind === 'limit' ? range.limit : undefined
  const snapshotsByMarketType = {
    Lend: useLendingSnapshots(
      { blockchainId, contractAddress: controllerAddress, timeOption, limit },
      enabled && marketType === MarketType.Lend,
    ),
    Mint: useCrvUsdSnapshots(
      { blockchainId, contractAddress: controllerAddress, timeOption, limit },
      enabled && marketType === MarketType.Mint,
    ),
  } satisfies { [T in MarketType]: Query<SnapshotByMarketType[T][]> }

  return snapshotsByMarketType[marketType] as Query<SnapshotsByMarketType<TMarketType>>
}
