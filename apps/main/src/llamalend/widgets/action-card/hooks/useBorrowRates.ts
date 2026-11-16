import {
  type CollateralYields,
  getEstimatedNetBorrowApr,
  getSnapshotCollateralYields,
} from '@/llamalend/collateral-yields'
import { useMarketFutureRates } from '@/llamalend/queries/market/market-future-rates.query'
import { useMarketRates } from '@/llamalend/queries/market/market-rates.query'
import { useMarketSnapshots } from '@/llamalend/queries/market/market-snapshots.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { MarketParams } from '@evm-ui/queries/query-types'
import type { MarketType } from '@evm-ui/types/market'
import { BlockchainIds } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, q, Query, type QueryProp } from '@ui/features/queries/util'
import { decimal } from '@ui/lib/decimal'

const addNetApr = <T extends { borrowApr?: Decimal }>(
  rates: Query<T>,
  collateralYields: Query<CollateralYields>,
): [QueryProp<T>, QueryProp<Decimal | null>] => [
  q(rates),
  combineQueries([rates, collateralYields], ({ borrowApr }, collateralYields) =>
    maybe(borrowApr, borrowApr => decimal(getEstimatedNetBorrowApr(+borrowApr, collateralYields, null))),
  ),
]

/** Returns previous/current borrow rates and net borrow APR for LoanActionInfoList. */
export function useBorrowRates<ChainId extends IChainId>(
  {
    params: { chainId, marketId },
    debtDelta,
    marketType,
    controllerAddress,
  }: {
    params: MarketParams<ChainId>
    marketType: MarketType
    controllerAddress: Address | undefined
    debtDelta?: Decimal | null
  },
  enabled: boolean,
) {
  const snapshots = useMarketSnapshots({
    marketType,
    controllerAddress,
    blockchainId: chainId && BlockchainIds[chainId],
    enabled,
  })
  const collateralYields = mapQuery(snapshots, snapshots => getSnapshotCollateralYields(snapshots.at(-1)))
  // Without `debt`, `rates`/`netBorrowApr` are disabled on purpose. `ActionInfo` shows `prevRates` as current.
  const [rates, netBorrowApr] = addNetApr(
    useMarketFutureRates({ chainId, marketId, debtDelta }, enabled),
    collateralYields,
  )
  const [prevRates, prevNetBorrowApr] = addNetApr(useMarketRates({ chainId, marketId }, enabled), collateralYields)
  return {
    prevRates,
    rates,
    prevNetBorrowApr,
    netBorrowApr,
    collateralApy: mapQuery(snapshots, data => data.at(-1)?.collateralToken.rebasingYield),
  }
}
