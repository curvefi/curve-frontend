import { useSolvencyMarket } from '@/llamalend/hooks/useSolvencyMarket'
import { getControllerAddress, getTokens } from '@/llamalend/llama.utils'
import { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import {
  useMarketCapAndAvailable,
  useMarketTotalCollateral,
  useMarketMaxLeverage,
  useMarketLiquidationHealthDistribution,
  useMarketUsers,
} from '@/llamalend/queries/market'
import type { Endpoint } from '@curvefi/prices-api/lending'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import type { MarketParams } from '@ui-kit/lib/model/query/root-keys'
import { LlamaMarketType } from '@ui-kit/types/market'
import { Chain, requireBlockchainId } from '@ui-kit/utils/network'

const endpointFromMarketType: Record<LlamaMarketType, Endpoint> = {
  [LlamaMarketType.Lend]: 'lending',
  [LlamaMarketType.Mint]: 'crvusd',
}

export const useAdvancedDetailsData = ({
  chainId,
  market,
  marketId,
  marketType,
}: MarketParams & { market: LlamaMarketTemplate | undefined; marketType: LlamaMarketType }) => {
  const { collateralToken, borrowToken } = market ? getTokens(market) : {}
  const blockchainId = chainId == null ? undefined : requireBlockchainId(chainId as Chain)
  const controllerAddress = getControllerAddress(market)
  const endpoint = endpointFromMarketType[marketType]

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
  const { data: solvencyData, isLoading: solvencyLoading } = useSolvencyMarket({
    blockchainId,
    controllerAddress,
  })
  const { data: marketUsers, isLoading: marketUsersLoading } = useMarketUsers({
    endpoint,
    blockchainId,
    contractAddress: controllerAddress,
  })
  const { data: liquidationHealthDistribution, isLoading: liquidationHealthDistributionLoading } =
    useMarketLiquidationHealthDistribution({
      endpoint,
      blockchainId,
      contractAddress: controllerAddress,
    })

  const collateralTotal = totalCollateral == null ? null : Number(totalCollateral.collateral)
  const borrowedTotal = totalCollateral == null ? null : Number(totalCollateral.borrowed)
  const collateralUsdValue = collateralTotal && collateralUsdRate && collateralTotal * collateralUsdRate
  const borrowedUsdValue = borrowedTotal && borrowedUsdRate && borrowedTotal * borrowedUsdRate
  const combinedCollateralUsdValue =
    collateralUsdValue == null || borrowedUsdValue == null ? null : collateralUsdValue + borrowedUsdValue

  return {
    marketType,
    collateral: {
      collateralSymbol: collateralToken?.symbol ?? null,
      totalCollateral: collateralTotal,
      borrowedSymbol: borrowToken?.symbol ?? null,
      totalBorrowed: borrowedTotal,
      combinedCollateralUsdValue,
      collateralUsdRate: collateralUsdRate ?? null,
      borrowedUsdRate: borrowedUsdRate ?? null,
      loading: !market || totalCollateralLoading || collateralUsdRateLoading || borrowedUsdRateLoading,
    },
    maxLeverage: {
      value: maxLeverageData,
      loading: !market || maxLeverageLoading,
    },
    availableLiquidity: {
      available: capAndAvailable?.available,
      totalAssets: capAndAvailable?.totalAssets,
      loading: !market || capAndAvailableLoading,
    },
    totalBorrowers: {
      value: marketUsers?.count,
      loading: !market || marketUsersLoading,
    },
    averageHealth: {
      value: liquidationHealthDistribution?.meanHealth,
      distribution: liquidationHealthDistribution,
      loading: !market || liquidationHealthDistributionLoading,
    },
    ...(marketType === LlamaMarketType.Lend && {
      solvency: {
        value: solvencyData?.solvencyPercent,
        badDebtUsd: solvencyData?.badDebtUsd,
        loading: !market || solvencyLoading,
      },
    }),
  }
}
