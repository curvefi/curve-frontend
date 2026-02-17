import { group } from 'vest'
import { getLlamaMarket, getMintBorrowRates } from '@/llamalend/llama.utils'
import { validateDebt } from '@/llamalend/queries/validation/borrow-fields.validation'
import { validateDepositAmount } from '@/llamalend/queries/validation/supply.validation'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { type MarketQuery } from '@ui-kit/lib/model'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { decimal, type Decimal } from '@ui-kit/utils'

type BorrowApyQuery = MarketQuery<IChainId> & { debt: Decimal }
type BorrowFutureApyParams = FieldsOf<BorrowApyQuery>

type SupplyApyQuery = MarketQuery<IChainId> & { reserves: Decimal }
type SupplyFutureApyParams = FieldsOf<SupplyApyQuery>

export type BorrowFutureRatesResult = {
  borrowApr: Decimal
  borrowApy?: Decimal
  lendApr?: Decimal
  lendApy?: Decimal
}

const RESERVES = '0' // Used in borrow scenarios where only debt changes, reserves stay at 0
const DEBT = '0' // Used in supply scenarios where only reserves change, debt stays at 0

const convertRates = ({
  borrowApr,
  borrowApy,
  lendApr,
  lendApy,
}: { [K in keyof BorrowFutureRatesResult]: string }): BorrowFutureRatesResult => ({
  borrowApr: decimal(borrowApr)!,
  borrowApy: decimal(borrowApy),
  lendApy: decimal(lendApy),
  lendApr: decimal(lendApr),
})

const fetchFutureRates = async (marketId: string, reserves: Decimal, debt: Decimal) => {
  const market = getLlamaMarket(marketId)
  return market instanceof LendMarketTemplate
    ? convertRates(await market.stats.futureRates(reserves, debt))
    : convertRates(getMintBorrowRates((await market.stats.parameters()).future_rate))
}

/** Calculates future borrow/lend rates when debt changes (e.g., borrowing more or repaying) - used for borrow operations */
export const { useQuery: useMarketFutureRates } = queryFactory({
  queryKey: ({ chainId, marketId, debt }: BorrowFutureApyParams) =>
    [...rootKeys.market({ chainId, marketId }), 'market-future-rates', { debt }] as const,
  queryFn: async ({ marketId, debt }: BorrowApyQuery) => await fetchFutureRates(marketId, RESERVES, debt),
  validationSuite: createValidationSuite(({ chainId, marketId, debt }: BorrowFutureApyParams) => {
    marketIdValidationSuite({ chainId, marketId })
    group('borrowFormValidationGroup', () => validateDebt(debt))
  }),
})

/** Calculates future borrow/lend rates when reserves change (e.g., depositing or withdrawing) - used for supply operations */
export const { useQuery: useMarketSupplyFutureRates } = queryFactory({
  queryKey: ({ chainId, marketId, reserves }: SupplyFutureApyParams) =>
    [...rootKeys.market({ chainId, marketId }), 'market-supply-future-rates', { reserves }] as const,
  queryFn: async ({ marketId, reserves }: SupplyApyQuery) => await fetchFutureRates(marketId, reserves, DEBT),
  validationSuite: createValidationSuite(({ chainId, marketId, reserves }: SupplyFutureApyParams) => {
    marketIdValidationSuite({ chainId, marketId })
    group('supplyFormValidationGroup', () => validateDepositAmount(reserves, { depositRequired: true }))
  }),
})
