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
import { mapQuery, q } from '@ui-kit/types/util'
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
      ({ borrowed, collateral }, collateralUsdRate, borrowedUsdRate) => ({
        collateralSymbol: collateralToken?.symbol,
        totalCollateral: collateral,
        borrowedSymbol: borrowToken?.symbol,
        totalBorrowed: borrowed,
        combinedCollateralUsdValue: maybes(
          [collateralUsdRate, borrowedUsdRate, collateral, borrowed],
          ([collateralUsdRate, borrowedUsdRate, collateral, borrowed]) =>
            +collateral * collateralUsdRate + +borrowed * borrowedUsdRate,
        ),
        collateralUsdRate,
        borrowedUsdRate,
      }),
    ),
    maxLeverage: mapQuery(maxLeverage, value => ({ value })),
    borrowedUsdRate: q(borrowedUsdRate),
    availableLiquidity: mapQuery(capAndAvailable, ({ available, totalAssets, borrowCap }) => ({
      available,
      totalAssets,
      borrowCap,
      borrowSymbol: borrowToken?.symbol,
    })),
    totalBorrowers: mapQuery(marketUsers, ({ count }) => ({ value: count })),
    averageHealth: mapQuery(liquidationHealthDistribution, distribution => ({
      value: distribution.meanHealth,
      distribution,
    })),
    ...(marketType === LlamaMarketType.Lend && {
      solvency: mapQuery(solvency, ({ solvencyPercent, badDebtUsd }) => ({ value: solvencyPercent, badDebtUsd })),
    }),
  }
}
