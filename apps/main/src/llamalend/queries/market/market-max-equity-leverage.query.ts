import { group } from 'vest'
import { getMarket, hasZapV2 } from '@/llamalend/llama.utils'
import { validateRange } from '@/llamalend/queries/validation/borrow-fields.validation'
import { marketLeverageValidationSuite } from '@/llamalend/queries/validation/leverage.validation'
import type { IChainId } from '@curvefi/api/lib/interfaces'
import type { MarketQuery } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { type FieldsOf } from '@ui/lib/validation/types'

type MaxEquityLeverageQuery = MarketQuery<IChainId> & { range: number }
type MaxEquityLeverageParams = FieldsOf<MaxEquityLeverageQuery>

/** The highest equity leverage the leverage zap can open at `range` bands, null without zap V2 */
export const { useQuery: useMarketMaxEquityLeverage } = queryFactory({
  queryKey: ({ chainId, marketId, range }: MaxEquityLeverageParams) =>
    ({ name: 'maxEquityLeverage', chainId, marketId, range }) as const,
  queryFn: async ({ marketId, range }: MaxEquityLeverageQuery): Promise<Decimal | null> => {
    const market = getMarket(marketId)
    return hasZapV2(market) ? ((await market.leverageZapV2.maxEquityLeverage(range)) as Decimal) : null
  },
  category: 'llamalend.market',
  validationSuite: createValidationSuite(({ chainId, marketId, range }: MaxEquityLeverageParams) => {
    marketLeverageValidationSuite.run({ chainId, marketId })
    group('rangeValidationGroup', () => validateRange(range))
  }),
})
