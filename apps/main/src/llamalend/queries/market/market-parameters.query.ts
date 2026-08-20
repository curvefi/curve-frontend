import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { queryFactory } from '@evm-ui/lib/model/query'
import { marketIdValidationSuite } from '@evm-ui/lib/model/query/market-id-validation'
import { rootKeys } from '@evm-ui/lib/model/query/root-keys'
import type { MarketQuery, MarketParams } from '@evm-ui/lib/model/query/root-keys'
import { MarketVersion } from '@evm-ui/types/market'
import { decimal } from '@evm-ui/utils'
import { getLendMarketVersion, getMarket } from '../../llama.utils'
import { convertRates } from '../../rates.utils'

export const { useQuery: useMarketParameters } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'parameters'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getMarket(marketId)
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
    const [{ admin_fee, base_price, fee, liquidation_discount, loan_discount }, a, adminPercentage] = await Promise.all(
      [market.stats.parameters(), market.prices.A(), market.stats.adminPercentage()],
    )
    return {
      fee: decimal(fee),
      admin_fee: getLendMarketVersion(market) === MarketVersion.v2 ? decimal(adminPercentage) : decimal(admin_fee),
      liquidation_discount: decimal(liquidation_discount),
      loan_discount: decimal(loan_discount),
      base_price: decimal(base_price),
      A: Number(a),
    }
  },
  category: 'llamalend.marketParams',
  validationSuite: marketIdValidationSuite,
})
