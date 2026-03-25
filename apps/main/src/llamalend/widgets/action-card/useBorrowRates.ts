import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useLlamaSnapshot } from '@/llamalend/queries/llamma-snapshots.query'
import { useMarketFutureRates, useMarketRates } from '@/llamalend/queries/market'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import { CrvUsdSnapshot } from '@ui-kit/entities/crvusd-snapshots'
import { LendingSnapshot } from '@ui-kit/entities/lending-snapshots'
import type { MarketParams } from '@ui-kit/lib/model'
import { combineQueryState } from '@ui-kit/lib/queries/combine'
import { q, Query } from '@ui-kit/types/util'
import { BlockchainIds, decimal, decimalMinus } from '@ui-kit/utils'

/**
 * Combines the given markets rates and snapshotsQuery to calculate net borrow APR.
 */
const toNetBorrowApr = (
  rates: Query<{ borrowApr?: Decimal }>,
  snapshotsQuery: Query<CrvUsdSnapshot[] | LendingSnapshot[]>,
) =>
  q({
    data:
      rates.data?.borrowApr &&
      decimalMinus(rates.data.borrowApr, decimal(snapshotsQuery.data?.at(-1)?.collateralToken?.rebasingYieldApr)),
    ...combineQueryState(rates, snapshotsQuery),
  })

/** Returns previous/current borrow rates and net borrow APR for LoanActionInfoList. */
export function useBorrowRates<ChainId extends IChainId>(
  {
    params: { chainId, marketId },
    debt,
    market,
  }: {
    params: MarketParams<ChainId>
    market: LlamaMarketTemplate | undefined
    debt?: Decimal
  },
  enabled = true,
) {
  const prevRates = q(useMarketRates({ chainId, marketId }, enabled))
  const rates = q(useMarketFutureRates({ chainId, marketId, debt }, enabled)) // query is disabled if debt is not passed
  const snapshotsQuery = useLlamaSnapshot(market, chainId && BlockchainIds[chainId], enabled)
  const prevNetBorrowApr = toNetBorrowApr(prevRates, snapshotsQuery)
  const netBorrowApr = toNetBorrowApr(rates, snapshotsQuery)
  return { prevRates, rates, prevNetBorrowApr, netBorrowApr }
}
