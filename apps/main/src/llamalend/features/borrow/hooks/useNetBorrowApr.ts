import { useLlamaSnapshot } from '@/llamalend/queries/llamma-snapshots.query'
import { computeDecimalTotalRate } from '@/llamalend/rates.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import type { MarketParams } from '@ui-kit/lib/model/query'
import type { Query } from '@ui-kit/types/util'
import { BlockchainIds, type Decimal } from '@ui-kit/utils'

type BorrowRatesQuery = Query<{ borrowApr?: Decimal } | null>

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
      error: [marketRates.error, snapshotsQuery.error].find(Boolean),
    },
    futureBorrowApr: marketFutureRates && {
      data: computeDecimalTotalRate(marketFutureRates.data?.borrowApr, rebasingYieldApr),
      isLoading: [marketFutureRates.isLoading, snapshotsQuery.isLoading].some(Boolean),
      error: [marketFutureRates.error, snapshotsQuery.error].find(Boolean),
    },
  }
}
