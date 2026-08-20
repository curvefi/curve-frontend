import { useMarketFutureRates, useMarketRates, useMarketSnapshots } from '@/llamalend/queries/market'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { CrvUsdSnapshot } from '@evm-ui/entities/crvusd-snapshots'
import { LendingSnapshot } from '@evm-ui/entities/lending-snapshots'
import type { MarketParams } from '@evm-ui/lib/model'
import { combineQueries } from '@evm-ui/lib/queries/combine'
import type { MarketType } from '@evm-ui/types/market'
import { q, Query, type QueryProp } from '@evm-ui/types/util'
import { BlockchainIds, decimal, decimalMinus } from '@evm-ui/utils'

/**
 * Combines the given markets rates and snapshotsQuery to calculate net borrow APR.
 */
const addNetApr = <T extends { borrowApr?: Decimal }>(
  rates: Query<T>,
  snapshotsQuery: Query<CrvUsdSnapshot[] | LendingSnapshot[]>,
): [QueryProp<T>, QueryProp<Decimal | null>] => [
  q(rates),
  combineQueries(
    [rates, snapshotsQuery],
    ({ borrowApr }, data) =>
      borrowApr && decimalMinus(borrowApr, decimal(data?.at(-1)?.collateralToken?.rebasingYieldApr)),
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
  // Without `debt`, `rates`/`netBorrowApr` are disabled on purpose. `ActionInfo` shows `prevRates` as current.
  const [rates, netBorrowApr] = addNetApr(useMarketFutureRates({ chainId, marketId, debtDelta }, enabled), snapshots)
  const [prevRates, prevNetBorrowApr] = addNetApr(useMarketRates({ chainId, marketId }, enabled), snapshots)
  return { prevRates, rates, prevNetBorrowApr, netBorrowApr }
}
