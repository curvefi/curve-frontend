import { useSolvencyMarket } from '@/llamalend/hooks/useSolvencyMarket'
import { getControllerAddress, getTokens } from '@/llamalend/llama.utils'
import { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import {
  useMarketCapAndAvailable,
  useMarketLiquidationHealthDistribution,
  useMarketMaxLeverage,
  useMarketTotalCollateral,
  useMarketUsers,
} from '@/llamalend/queries/market'
import type { Endpoint } from '@curvefi/prices-api/lending'
import { maybe, maybes } from '@primitives/objects.utils'
import { combineQueries } from '@ui-kit/lib'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import type { MarketParams } from '@ui-kit/lib/model/query/root-keys'
import { LlamaMarketType } from '@ui-kit/types/market'
import { mapQuery } from '@ui-kit/types/util'
import { requireBlockchainId } from '@ui-kit/utils/network'

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
  const blockchainId = maybe(chainId, chainId => requireBlockchainId(chainId))
  const controllerAddress = getControllerAddress(market)
  const endpoint = endpointFromMarketType[marketType]

  const maxLeverage = useMarketMaxLeverage({
    chainId,
    marketId,
    range: market?.minBands ?? 0,
  })
  const capAndAvailable = useMarketCapAndAvailable({ chainId, marketId })
  const totalCollateral = useMarketTotalCollateral({ chainId, marketId })
  const collateralUsdRate = useTokenUsdRate({
    chainId,
    tokenAddress: collateralToken?.address,
  })
  const borrowedUsdRate = useTokenUsdRate({
    chainId,
    tokenAddress: borrowToken?.address,
  })
  const solvency = useSolvencyMarket({
    blockchainId,
    controllerAddress,
    marketType,
  })
  const marketUsers = useMarketUsers({
    endpoint,
    blockchainId,
    contractAddress: controllerAddress,
  })
  const liquidationHealthDistribution = useMarketLiquidationHealthDistribution({
    endpoint,
    blockchainId,
    contractAddress: controllerAddress,
  })
  return {
    marketType,
    collateral: combineQueries(
      [totalCollateral, collateralUsdRate, borrowedUsdRate],
      (totalCollateral, collateralUsdRate, borrowedUsdRate) => {
        const collateralTotal = Number(totalCollateral.collateral)
        const borrowedTotal = Number(totalCollateral.borrowed)
        const collateralUsdValue = collateralTotal && collateralUsdRate && collateralTotal * collateralUsdRate
        const borrowedUsdValue = borrowedTotal && borrowedUsdRate && borrowedTotal * borrowedUsdRate
        const combinedCollateralUsdValue =
          maybes(
            [collateralUsdValue, borrowedUsdValue],
            ([collateralUsdValue, borrowedUsdValue]) => collateralUsdValue + borrowedUsdValue,
          ) ?? null

        return {
          collateralSymbol: collateralToken?.symbol ?? null,
          totalCollateral: collateralTotal,
          borrowedSymbol: borrowToken?.symbol ?? null,
          totalBorrowed: borrowedTotal,
          combinedCollateralUsdValue,
          collateralUsdRate: collateralUsdRate ?? null,
          borrowedUsdRate: borrowedUsdRate ?? null,
        }
      },
    ),
    maxLeverage: mapQuery(maxLeverage, value => ({ value })),
    availableLiquidity: mapQuery(capAndAvailable, ({ available, totalAssets, borrowCap }) => ({
      available,
      totalAssets,
      borrowCap,
    })),
    totalBorrowers: mapQuery(marketUsers, ({ count }) => ({ value: count })),
    averageHealth: mapQuery(liquidationHealthDistribution, distribution => ({
      value: distribution.meanHealth,
      distribution,
    })),
    ...(marketType === LlamaMarketType.Lend && {
      solvency: mapQuery(solvency, ({ solvencyPercent, badDebtUsd }) => ({
        value: solvencyPercent,
        badDebtUsd,
      })),
    }),
  }
}
