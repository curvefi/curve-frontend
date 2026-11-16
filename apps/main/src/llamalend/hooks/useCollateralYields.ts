import { type CollateralYields, getSnapshotCollateralYields, withOnChainCrvApr } from '@/llamalend/collateral-yields'
import { useMarketCollateralCrvApr } from '@/llamalend/queries/market/market-collateral-crv-apr.query'
import { useMarketSnapshots } from '@/llamalend/queries/market/market-snapshots.query'
import type { MarketParams } from '@evm-ui/queries/query-types'
import type { MarketType } from '@evm-ui/types/market'
import { BlockchainIds } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import { maybe } from '@primitives/objects.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { fallbackQ, mapQuery, type QueryProp } from '@ui/features/queries/util'

/**
 * Collateral yields of a market page: the live snapshot, with the CRV APR read on chain once llamalend.js has it.
 * The snapshot CRV APR shows while the on-chain read loads, when it fails and when it is disabled (v1 and mint markets).
 * Every caller reads the live snapshot, because the latest daily snapshot of a time range holds an older LP base APR.
 */
export const useCollateralYields = (
  {
    marketType,
    controllerAddress,
    ...params
  }: MarketParams & { marketType: MarketType; controllerAddress: Address | undefined },
  enabled?: boolean,
): QueryProp<CollateralYields> => {
  const snapshotYields = mapQuery(
    useMarketSnapshots({
      marketType,
      controllerAddress,
      blockchainId: maybe(params.chainId, chainId => BlockchainIds[chainId]),
      range: { kind: 'limit', limit: 1 },
      enabled,
    }),
    snapshots => getSnapshotCollateralYields(snapshots.at(-1)),
  )
  return fallbackQ(
    combineQueries([snapshotYields, useMarketCollateralCrvApr(params, enabled)], withOnChainCrvApr),
    snapshotYields,
  )
}
