import { getMarket, hasLegacyMintLeverage, hasV2Leverage, hasZapV2 } from '@/llamalend/llama.utils'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'

/**
 * Determines the appropriate create loan implementation based on market type and leverage settings.
 *
 * For leveraged operations:
 * - Markets with ZapV2 leverage: 'zapV2' using `market.leverageZapV2`
 * - Static legacy Mint markets: 'V0' using `market.leverage`
 *
 * For non-leveraged operations:
 * - 'unleveraged' using `market` directly
 */
export function getCreateLoanImplementation(marketId: string | MarketTemplate, leverageEnabled: boolean) {
  const market = getMarket(marketId)
  const unsupported = (): never => {
    throw new Error(`Leveraged create loan is not supported for market ${market.id}`)
  }
  return market instanceof LendMarketTemplate
    ? leverageEnabled
      ? hasZapV2(market)
        ? (['zapV2', market.leverageZapV2] as const)
        : hasLegacyMintLeverage(market)
          ? (['V1', market.leverage] as const)
          : unsupported()
      : (['unleveraged', market.loan] as const)
    : leverageEnabled
      ? hasZapV2(market)
        ? (['zapV2', market.leverageZapV2] as const)
        : hasV2Leverage(market)
          ? (['V2', market.leverageV2] as const)
          : hasLegacyMintLeverage(market)
            ? (['V0', market.leverage] as const)
            : unsupported()
      : (['unleveraged', market] as const)
}
