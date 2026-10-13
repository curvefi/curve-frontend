import { getMarket, isLendMarket } from '@/llamalend/llama.utils'
import type { IsoDateString } from '@curvefi/prices-api/timestamp'
import type { MarketQuery, MarketParams } from '@evm-ui/queries/query-types'
import { marketIdValidationSuite } from '@evm-ui/queries/validation/market-id-validation'
import { queryFactory } from '@ui/features/queries/factory'
import { convertRates } from '../../rates.utils'
import { IS_GETTER, USE_API } from './market.constants'

export const { useQuery: useMarketRates } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => ({ name: 'rates', version: 2, chainId, marketId }) as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getMarket(marketId)
    return {
      rates: convertRates(
        isLendMarket(market) ? await market.stats.rates(IS_GETTER, USE_API) : (await market.stats.parameters()).rates,
      ),
      fetchedAt: new Date().toISOString() as IsoDateString,
    }
  },
  category: 'llamalend.market',
  validationSuite: marketIdValidationSuite,
})

export type MarketRates = NonNullable<ReturnType<typeof useMarketRates>['data']>['rates']
