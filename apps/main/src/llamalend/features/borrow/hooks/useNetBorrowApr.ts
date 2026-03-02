import { useLlamaSnapshot } from '@/llamalend/queries/llamma-snapshots.query'
import { computeDecimalTotalRate } from '@/llamalend/rates.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { Decimal } from '@primitives/decimal.utils'
import type { MarketParams } from '@ui-kit/lib/model/query'
import type { QueryProp } from '@ui-kit/types/util'
import { BlockchainIds } from '@ui-kit/utils'

type BorrowRatesQuery = QueryProp<{ borrowApr?: Decimal } | null>

export function useNetBorrowApr(
  {
    market,
    params,
    marketRates,
    marketFutureRates,
  }: {
    market: LendMarketTemplate | MintMarketTemplate | undefined
    params: MarketParams
    marketRates?: BorrowRatesQuery
    marketFutureRates?: BorrowRatesQuery
  },
  isOpen: boolean,
) {
  const blockchainId = params?.chainId != null ? BlockchainIds[params.chainId] : undefined
  const snapshotsQuery = useLlamaSnapshot(market, blockchainId, isOpen)
  const rebasingYieldApr = snapshotsQuery.data?.at(-1)?.collateralToken?.rebasingYieldApr ?? 0

  return {
    marketRates,
    marketFutureRates,
    netBorrowApr: marketRates && {
      data: computeDecimalTotalRate(marketRates.data?.borrowApr, rebasingYieldApr),
      isLoading: [marketRates.isLoading, snapshotsQuery.isLoading].some(Boolean),
      error: [marketRates.error, snapshotsQuery.error].find(Boolean) ?? null,
    },
    futureBorrowApr: marketFutureRates && {
      data: computeDecimalTotalRate(marketFutureRates.data?.borrowApr, rebasingYieldApr),
      isLoading: [marketFutureRates.isLoading, snapshotsQuery.isLoading].some(Boolean),
      error: [marketFutureRates.error, snapshotsQuery.error].find(Boolean) ?? null,
    },
  }
}
