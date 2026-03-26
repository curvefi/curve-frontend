import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useLlamaSnapshot } from '@/llamalend/queries/llamma-snapshots.query'
import { useMarketFutureRates, useMarketRates } from '@/llamalend/queries/market'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import { CrvUsdSnapshot } from '@ui-kit/entities/crvusd-snapshots'
import { LendingSnapshot } from '@ui-kit/entities/lending-snapshots'
import type { MarketParams } from '@ui-kit/lib/model'
import { combineQueryState } from '@ui-kit/lib/queries/combine'
import { q, Query, type QueryProp } from '@ui-kit/types/util'
import { BlockchainIds, decimal, decimalMinus } from '@ui-kit/utils'

/**
 * Combines the given markets rates and snapshotsQuery to calculate net borrow APR.
 */
const addNetApr = <T extends { borrowApr?: Decimal }>(
  rates: Query<T>,
  snapshotsQuery: Query<CrvUsdSnapshot[] | LendingSnapshot[]>,
) => {
  const rebasingYieldApr = decimal(snapshotsQuery.data?.at(-1)?.collateralToken?.rebasingYieldApr)
  const borrowApr = rates.data?.borrowApr
  const borrowNetApr = q({
    data: borrowApr && decimalMinus(borrowApr, rebasingYieldApr),
    ...combineQueryState(rates, snapshotsQuery),
  })
  return [q(rates), borrowNetApr] satisfies [QueryProp<T>, QueryProp<Decimal | null>]
}

/** Returns previous/current borrow rates and net borrow APR for LoanActionInfoList. */
export function useBorrowRates<ChainId extends IChainId>(
  {
    params: { chainId, marketId },
    debtDelta,
    market,
  }: {
    params: MarketParams<ChainId>
    market: LlamaMarketTemplate | undefined
    debtDelta?: Decimal | null
  },
  enabled: boolean,
) {
  const snapshots = useLlamaSnapshot(market, chainId && BlockchainIds[chainId], enabled)
  // Without `debt`, `rates`/`netBorrowApr` are disabled on purpose. `ActionInfo` shows `prevRates` as current.
  const [rates, netBorrowApr] = addNetApr(useMarketFutureRates({ chainId, marketId, debtDelta }, enabled), snapshots)
  const [prevRates, prevNetBorrowApr] = addNetApr(useMarketRates({ chainId, marketId }, enabled), snapshots)
  return { prevRates, rates, prevNetBorrowApr, netBorrowApr }
}
