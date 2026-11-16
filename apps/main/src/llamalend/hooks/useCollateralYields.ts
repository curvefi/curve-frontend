import { type CollateralYields, getSnapshotCollateralYields, withOnChainCrvApr } from '@/llamalend/collateral-yields'
import { useMarketCollateralCrvApr } from '@/llamalend/queries/market/market-collateral-crv-apr.query'
import type { CrvUsdSnapshot } from '@evm-ui/queries/crvusd-snapshots.query'
import type { LendingSnapshot } from '@evm-ui/queries/lending-snapshots.query'
import type { MarketParams } from '@evm-ui/queries/query-types'
import { combineQueries } from '@ui/features/queries/combine'
import { fallbackQ, mapQuery, type Query, type QueryProp } from '@ui/features/queries/util'

/**
 * Collateral yields of a market page: the latest snapshot, with the CRV APR read on chain once llamalend.js has it.
 * The snapshot CRV APR shows while the on-chain read loads, when it fails and when it is disabled (v1 and mint markets).
 */
export const useCollateralYields = (
  { snapshots, ...params }: MarketParams & { snapshots: Query<(LendingSnapshot | CrvUsdSnapshot)[]> },
  enabled?: boolean,
): QueryProp<CollateralYields> => {
  const snapshotYields = mapQuery(snapshots, snapshots => getSnapshotCollateralYields(snapshots.at(-1)))
  return fallbackQ(
    combineQueries([snapshotYields, useMarketCollateralCrvApr(params, enabled)], withOnChainCrvApr),
    snapshotYields,
  )
}
