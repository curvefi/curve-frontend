import { getLlamaMarket, hasV2Leverage } from '@/llamalend/llama.utils'
import { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'

/**
 * Determines the appropriate create loan implementation based on market type and leverage settings.
 *
 * For leveraged operations:
 * - LendMarketTemplate with zapV2 leverage: 'zapV2' using `market.leverageZapV2`
 * - MintMarketTemplate with V2 leverage: 'V2' using `market.leverageV2`
 * - MintMarketTemplate without V2 leverage: 'V0' using `market.leverage`
 *
 * For non-leveraged operations:
 * - 'unleveraged' using `market` directly
 */
export function getCreateLoanImplementation(marketId: string | LlamaMarketTemplate, leverageEnabled: boolean) {
  const market = typeof marketId === 'string' ? getLlamaMarket(marketId) : marketId
  if (!leverageEnabled) {
    return ['unleveraged', market] as const
  }
  if (market instanceof LendMarketTemplate) {
    return market.leverageZapV2.hasLeverage()
      ? (['zapV2', market.leverageZapV2] as const)
      : (['V1', market.leverage] as const)
  }
  if (hasV2Leverage(market)) {
    return ['V2', market.leverageV2] as const
  }
  return ['V0', market.leverage] as const
}
