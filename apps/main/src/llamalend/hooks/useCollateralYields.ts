import { type CollateralYields, getSnapshotCollateralYields, toCollateralYields } from '@/llamalend/collateral-yields'
import { useMarketCollateralRewardsStats } from '@/llamalend/queries/market/market-collateral-rewards-stats.query'
import { useMarketSnapshots } from '@/llamalend/queries/market/market-snapshots.query'
import type { MarketParams } from '@evm-ui/queries/query-types'
import type { MarketType } from '@evm-ui/types/market'
import { BlockchainIds } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import { maybe } from '@primitives/objects.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { fallbackQ, type FieldsOrQueries, mapQuery, type QueryProp, toValue } from '@ui/features/queries/util'

// TODO: get the LP base APR from llamalend.js
/** Collateral yields from the live snapshot, with the CRV APR read on chain when the market has collateral rewards */
export const useCollateralYields = (
  {
    marketType,
    controllerAddress,
    ...params
  }: FieldsOrQueries<MarketParams> & { marketType: MarketType; controllerAddress: Address | undefined },
  enabled?: boolean,
): QueryProp<CollateralYields> => {
  const snapshotYields = mapQuery(
    useMarketSnapshots({
      marketType,
      controllerAddress,
      blockchainId: maybe(toValue(params.chainId), chainId => BlockchainIds[chainId]),
      range: { kind: 'limit', limit: 1 },
      enabled,
    }),
    snapshots => getSnapshotCollateralYields(snapshots.at(-1)),
  )
  return fallbackQ(
    combineQueries([snapshotYields, useMarketCollateralRewardsStats(params, enabled)], (yields, { crvApr }) =>
      toCollateralYields({ ...yields, crvApr }),
    ),
    snapshotYields,
  )
}
