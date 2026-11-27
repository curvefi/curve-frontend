import { group } from 'vest'
import { getMarket, hasZapV2 } from '@/llamalend/llama.utils'
import { MarketTemplate } from '@/llamalend/llamalend.types'
import { useMarketMaxLeverage } from '@/llamalend/queries/market/market-max-leverage.query'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { validateRange } from '@/llamalend/queries/validation/borrow-fields.validation'
import { marketLeverageValidationSuite } from '@/llamalend/queries/validation/leverage.validation'
import type { IChainId } from '@curvefi/api/lib/interfaces'
import { useLlamalendEquityLeverage } from '@evm-ui/hooks/useFeatureFlags'
import type { MarketParams, MarketQuery } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { type FieldsOf } from '@ui/lib/validation/types'

type MaxEquityLeverageQuery = MarketQuery<IChainId> & { range: number }
type MaxEquityLeverageParams = FieldsOf<MaxEquityLeverageQuery>

/** The highest equity leverage the leverage zap can open at `range` bands, null without zap V2 */
const { useQuery: useMarketMaxEquityLeverage } = queryFactory({
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

/** The max leverage of a market from the chain and from the prices API, as equity leverage behind the flag */
export const useMaxLeverage = ({
  chainId,
  marketId,
  marketQuery,
  apiMarket,
}: MarketParams & { marketQuery: QueryProp<MarketTemplate | null>; apiMarket: QueryProp<LlamaMarket | null> }) => {
  const isEquityLeverage = useLlamalendEquityLeverage()
  const params = { chainId, marketId, range: mapQuery(marketQuery, m => m?.minBands) }
  const maxLegacyLeverage = useMarketMaxLeverage(params, !isEquityLeverage)
  const maxEquityLeverage = useMarketMaxEquityLeverage(params, isEquityLeverage)
  return {
    onChain: isEquityLeverage ? maxEquityLeverage : maxLegacyLeverage,
    api: mapQuery(apiMarket, market => (isEquityLeverage ? market?.maxEquityLeverage : market?.maxLegacyLeverage)),
  }
}
