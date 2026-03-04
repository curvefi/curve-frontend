import { getTokens } from '@/llamalend/llama.utils'
import { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useMarketCapAndAvailable, useMarketTotalCollateral, useMarketMaxLeverage } from '@/llamalend/queries/market'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import type { MarketParams } from '@ui-kit/lib/model/query/root-keys'
import { LlamaMarketType } from '@ui-kit/types/market'

export const useAdvancedDetailsData = ({
  chainId,
  market,
  marketId,
  marketType,
}: MarketParams & { market: LlamaMarketTemplate | undefined; marketType: LlamaMarketType | undefined }) => {
  const { collateralToken, borrowToken } = market
    ? getTokens(market)
    : { collateralToken: undefined, borrowToken: undefined }
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
  const { data: borrowedUsdRate, isLoading: borrowedUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: borrowToken?.address,
  })

  const collateralTotal = totalCollateral == null ? null : Number(totalCollateral.collateral)
  const borrowedTotal = totalCollateral == null ? null : Number(totalCollateral.borrowed)
  const collateralUsdValue =
    collateralTotal != null && collateralUsdRate != null ? collateralTotal * collateralUsdRate : null
  const borrowedUsdValue = borrowedTotal != null && borrowedUsdRate != null ? borrowedTotal * borrowedUsdRate : null
  const combinedCollateralUsdValue =
    collateralUsdValue != null && borrowedUsdValue != null ? collateralUsdValue + borrowedUsdValue : null

  return {
    marketType,
    collateral: {
      collateralSymbol: collateralToken?.symbol ?? null,
      totalCollateral: collateralTotal,
      borrowedSymbol: borrowToken?.symbol ?? null,
      totalBorrowed: borrowedTotal,
      combinedCollateralUsdValue,
      usdRate: collateralUsdRate ?? null,
      loading: !market || totalCollateralLoading || collateralUsdRateLoading || borrowedUsdRateLoading,
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
