import { enforce, group, test } from 'vest'
import { getMarket } from '@/llamalend/llama.utils'
import { USE_API } from '@/llamalend/queries/market/market.constants'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { createValidationSuite, type FieldsOf } from '@evm-ui/lib'
import { type MarketQuery, queryFactory, rootKeys } from '@evm-ui/lib/model'
import { marketIdValidationSuite } from '@evm-ui/lib/model/query/market-id-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { convertRates } from '../../rates.utils'

type BorrowRateQuery = MarketQuery<IChainId> & {
  debtDelta: Decimal
}
type BorrowFutureRateParams = FieldsOf<BorrowRateQuery>

type SupplyRateQuery = MarketQuery<IChainId> & { reserves: Decimal }
type SupplyFutureRateParams = FieldsOf<SupplyRateQuery>

const RESERVES = '0' // Used in borrow scenarios where only debt changes, reserves stay at 0
const DEBT = '0' // Used in supply scenarios where only reserves change, debt stays at 0

const fetchFutureRates = async (marketId: string, reserves: Decimal, debtDelta: Decimal) => {
  const market = getMarket(marketId)
  return market instanceof LendMarketTemplate
    ? convertRates(await market.stats.futureRates(reserves, debtDelta, USE_API))
    : convertRates((await market.stats.parameters()).future_rates)
}

/** Calculates future borrow/lend rates when debt changes (e.g., borrowing more or repaying) - used for borrow operations */
export const { useQuery: useMarketFutureRates } = queryFactory({
  queryKey: ({ chainId, marketId, debtDelta }: BorrowFutureRateParams) =>
    [...rootKeys.market({ chainId, marketId }), 'futureRates', 'v1', { debtDelta }] as const,
  queryFn: async ({ marketId, debtDelta }: BorrowRateQuery) => await fetchFutureRates(marketId, RESERVES, debtDelta),
  category: 'llamalend.market',
  validationSuite: createValidationSuite(({ chainId, marketId, debtDelta }: BorrowFutureRateParams) => {
    marketIdValidationSuite({ chainId, marketId })
    group('borrowFormValidationGroup', () => {
      test('debtDelta', `Debt delta must be a non-zero number`, () => {
        enforce(debtDelta).isNumeric().notEquals(0)
      })
    })
  }),
})

/** Calculates future borrow/lend rates when reserves change (e.g., depositing or withdrawing) - used for supply operations */
export const { useQuery: useMarketSupplyFutureRates } = queryFactory({
  queryKey: ({ chainId, marketId, reserves }: SupplyFutureRateParams) =>
    [...rootKeys.market({ chainId, marketId }), 'futureRates', 'v1', { reserves }] as const,
  queryFn: async ({ marketId, reserves }: SupplyRateQuery) => await fetchFutureRates(marketId, reserves, DEBT),
  category: 'llamalend.market',
  validationSuite: createValidationSuite(({ chainId, marketId, reserves }: SupplyFutureRateParams) => {
    marketIdValidationSuite({ chainId, marketId })
    group('supplyFormValidationGroup', () =>
      test('reserves', `Reserves must be a non-zero number`, () => {
        enforce(reserves).isNumeric().notEquals(0)
      }),
    )
  }),
})
