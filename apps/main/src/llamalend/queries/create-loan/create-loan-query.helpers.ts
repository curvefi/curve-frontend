import { getLlamaMarket, hasV2Leverage, hasZapV2 } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'

/**
 * Determines the appropriate create loan implementation based on market type and leverage settings.
 *
 * For leveraged operations:
 * - LendMarketTemplate with zapV2 leverage: 'zapV2' using `market.leverageZapV2`
 * - LendMarketTemplate: 'V1' using `market.leverage`
 * - MintMarketTemplate with V2 leverage: 'V2' using `market.leverageV2`
 * - MintMarketTemplate without V2 leverage: 'V0' using `market.leverage`
 *
 * For non-leveraged operations:
 * - 'unleveraged' using `market` directly
 */
export function getCreateLoanImplementation(marketId: string, leverageEnabled: boolean) {
  const market = getLlamaMarket(marketId)
  return market instanceof LendMarketTemplate
    ? leverageEnabled
      ? hasZapV2(market)
        ? (['zapV2', market.leverageZapV2] as const)
        : (['V1', market.leverage] as const)
      : (['unleveraged', market.loan] as const)
    : leverageEnabled
      ? hasV2Leverage(market)
        ? (['V2', market.leverageV2] as const)
        : (['V0', market.leverage] as const)
      : (['unleveraged', market] as const)
}
