import { getTokens } from '@/llamalend/llama.utils'
import { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useMarketCapAndAvailable, useMarketTotalCollateral } from '@/llamalend/queries/market'
import { useMarketMaxLeverage } from '@/llamalend/queries/market-max-leverage.query'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import type { MarketParams } from '@ui-kit/lib/model/query/root-keys'
import { LlamaMarketType } from '@ui-kit/types/market'

export const useAdvancedDetailsData = ({
  chainId,
  market,
  marketId,
  marketType,
}: MarketParams & { market: LlamaMarketTemplate | undefined; marketType: LlamaMarketType | undefined }) => {
  const collateralToken = market ? getTokens(market).collateralToken : undefined
  const { data: maxLeverageData, isLoading: maxLeverageLoading } = useMarketMaxLeverage({
    chainId,
    marketId,
    range: market?.minBands ?? 0,
  })
  const { data: capAndAvailable, isLoading: capAndAvailableLoading } = useMarketCapAndAvailable({ chainId, marketId })
  const { data: totalCollateral, isLoading: totalCollateralLoading } = useMarketTotalCollateral({ chainId, marketId })
  const { data: collateralUsdRate, isLoading: collateralUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: collateralToken?.address,
  })

  const collateralTotal = totalCollateral == null ? null : Number(totalCollateral.collateral)

  return {
    marketType,
    collateral: {
      symbol: collateralToken?.symbol ?? null,
      tokenAddress: collateralToken?.address ?? null,
      total: collateralTotal,
      totalUsdValue: collateralTotal != null && collateralUsdRate != null ? collateralTotal * collateralUsdRate : null,
      usdRate: collateralUsdRate ?? null,
      loading: !market || totalCollateralLoading || collateralUsdRateLoading,
    },
    maxLeverage: {
      value: maxLeverageData,
      loading: !market || maxLeverageLoading,
    },
    availableLiquidity: {
      available: capAndAvailable?.available,
      cap: capAndAvailable?.cap,
      loading: !market || capAndAvailableLoading,
    },
  }
}
