import { group } from 'vest'
import { getMarket, hasLeverage, hasZapV2 } from '@/llamalend/llama.utils'
import { validateRange } from '@/llamalend/queries/validation/borrow-fields.validation'
import type { IChainId } from '@curvefi/api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { type MarketQuery, queryFactory, rootKeys } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'

type MaxLeverageQuery = MarketQuery<IChainId> & { range: number }
type MaxLeverageParams = FieldsOf<MaxLeverageQuery>

export const { useQuery: useMarketMaxLeverage } = queryFactory({
  queryKey: ({ chainId, marketId, range }: MaxLeverageParams) =>
    [...rootKeys.market({ chainId, marketId }), 'maxLeverage', { range }] as const,
  queryFn: async ({ marketId, range }: MaxLeverageQuery): Promise<Decimal> => {
    const market = getMarket(marketId)
    return hasLeverage(market)
      ? hasZapV2(market)
        ? ((await market.leverageZapV2.maxLeverage(range)) as Decimal)
        : ((await market.leverage.maxLeverage(range)) as Decimal)
      : '0'
  },
  category: 'llamalend.market',
  validationSuite: createValidationSuite(({ chainId, marketId, range }: MaxLeverageParams) => {
    marketIdValidationSuite({ chainId, marketId })
    group('rangeValidationGroup', () => validateRange(range))
  }),
})
