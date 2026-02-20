import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { queryFactory } from '@ui-kit/lib/model/query'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { rootKeys } from '@ui-kit/lib/model/query/root-keys'
import type { MarketQuery, MarketParams } from '@ui-kit/lib/model/query/root-keys'
import { decimal } from '@ui-kit/utils'
import { getLlamaMarket } from '../llama.utils'
import { convertRates } from '../rates.utils'

export const { useQuery: useMarketParameters } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'market-parameters'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getLlamaMarket(marketId)

    // Mint markets don't have their A value in the parameters
    // object, but we want it regardless for type similarity
    // with lend markets.
    if (market instanceof MintMarketTemplate) {
      const parameters = await market.stats.parameters()

      return {
        fee: decimal(parameters.fee),
        admin_fee: decimal(parameters.admin_fee),
        rates: convertRates(parameters.rates),
        future_rates: convertRates(parameters.future_rates),
        liquidation_discount: decimal(parameters.liquidation_discount),
        loan_discount: decimal(parameters.loan_discount),
        A: market.A,
      }
    } else {
      const parameters = await market.stats.parameters()

      return {
        fee: decimal(parameters.fee),
        admin_fee: decimal(parameters.admin_fee),
        liquidation_discount: decimal(parameters.liquidation_discount),
        loan_discount: decimal(parameters.loan_discount),
        base_price: decimal(parameters.base_price),
        A: Number(await market.A()),
      }
    }
  },
  refetchInterval: '1m',
  validationSuite: marketIdValidationSuite,
})
