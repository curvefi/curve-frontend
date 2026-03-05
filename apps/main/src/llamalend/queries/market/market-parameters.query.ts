import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { queryFactory } from '@ui-kit/lib/model/query'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { rootKeys } from '@ui-kit/lib/model/query/root-keys'
import type { MarketQuery, MarketParams } from '@ui-kit/lib/model/query/root-keys'
import { decimal } from '@ui-kit/utils'
import { getLlamaMarket } from '../../llama.utils'
import { convertRates } from '../../rates.utils'

export const { useQuery: useMarketParameters } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'parameters'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getLlamaMarket(marketId)
    if (market instanceof MintMarketTemplate) {
      const { admin_fee, fee, future_rates, liquidation_discount, loan_discount, rates } =
        await market.stats.parameters()
      return {
        fee: decimal(fee),
        admin_fee: decimal(admin_fee),
        rates: convertRates(rates),
        future_rates: convertRates(future_rates),
        liquidation_discount: decimal(liquidation_discount),
        loan_discount: decimal(loan_discount),
        A: market.A,
      }
    }
    const [{ admin_fee, base_price, fee, liquidation_discount, loan_discount }, a] = await Promise.all([
      market.stats.parameters(),
      market.prices.A(),
    ])
    return {
      fee: decimal(fee),
      admin_fee: decimal(admin_fee),
      liquidation_discount: decimal(liquidation_discount),
      loan_discount: decimal(loan_discount),
      base_price: decimal(base_price),
      A: Number(a),
    }
  },
  category: 'llamalend.marketParams',
  validationSuite: marketIdValidationSuite,
})
