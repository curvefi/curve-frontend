import { useSolvencyMarket } from '@/llamalend/hooks/useSolvencyMarket'
import {
  calculateLendMarketTvlUsd,
  calculateMintMarketTvlUsd,
  getControllerAddress,
  getTokens,
} from '@/llamalend/llama.utils'
import { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import {
  useMarketCapAndAvailable,
  useMarketMaxLeverage,
  useMarketTotalCollateral,
  useMarketUsers,
} from '@/llamalend/queries/market'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { Endpoint } from '@curvefi/prices-api/lending'
import { maybe, maybes } from '@primitives/objects.utils'
import { combineQueries } from '@ui-kit/lib'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import type { MarketParams } from '@ui-kit/lib/model/query/root-keys'
import { LlamaMarketType } from '@ui-kit/types/market'
import { fallbackQ, mapQuery, q, type QueryProp } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
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
  apiMarket,
}: MarketParams & {
  market: LlamaMarketTemplate | undefined
  marketType: LlamaMarketType
  apiMarket: QueryProp<LlamaMarket>
}) => {
  const { collateralToken, borrowToken } = getTokens(market, apiMarket.data) ?? {}
  const blockchainId = maybe(chainId, chainId => requireBlockchainId(chainId))
  const controllerAddress = getControllerAddress(market, apiMarket.data)
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
  const tvl = fallbackQ(
    marketType === LlamaMarketType.Lend
      ? combineQueries(
          [totalCollateral, capAndAvailable, collateralUsdRate, borrowedUsdRate],
          ({ borrowed, collateral }, { totalAssets, available }, collateralUsdRate, borrowedUsdRate) =>
            maybes(
              [borrowed, collateral, totalAssets, available, collateralUsdRate, borrowedUsdRate],
              (borrowed, collateral, totalAssets, available, collateralUsdRate, borrowedUsdRate) => ({
                value: calculateLendMarketTvlUsd({
                  borrowedBalanceUsd: +borrowed * borrowedUsdRate,
                  collateralBalanceUsd: +collateral * collateralUsdRate,
                  totalAssetsUsd: +totalAssets * borrowedUsdRate,
                  totalDebtUsd: (+totalAssets - +available) * borrowedUsdRate,
                }),
              }),
            ),
        )
      : combineQueries([totalCollateral, collateralUsdRate], ({ collateral }, collateralUsdRate) =>
          maybes([collateral, collateralUsdRate], (collateral, collateralUsdRate) => ({
            value: calculateMintMarketTvlUsd({ collateralAmountUsd: +collateral * collateralUsdRate }),
          })),
        ),
    mapQuery(apiMarket, ({ tvl }) => ({ value: tvl })),
  )

  return {
    marketType,
    collateral: fallbackQ(
      combineQueries(
        [totalCollateral, collateralUsdRate, borrowedUsdRate],
        ({ borrowed, collateral }, collateralUsdRate, borrowedUsdRate) => ({
          collateralSymbol: collateralToken?.symbol,
          totalCollateral: collateral,
          borrowedSymbol: borrowToken?.symbol,
          totalBorrowed: borrowed,
          combinedCollateralUsdValue: maybes(
            [collateralUsdRate, borrowedUsdRate, collateral, borrowed],
            (collateralUsdRate, borrowedUsdRate, collateral, borrowed) =>
              +collateral * collateralUsdRate + +borrowed * borrowedUsdRate,
          ),
          collateralUsdRate,
          borrowedUsdRate,
        }),
      ),
      mapQuery(apiMarket, ({ assets, totalCollateralUsd }) => ({
        collateralSymbol: assets.collateral.symbol,
        totalCollateral: decimal(assets.collateral.balance ?? 0),
        borrowedSymbol: assets.borrowed.symbol,
        totalBorrowed: decimal(assets.borrowed.balance ?? 0),
        combinedCollateralUsdValue: totalCollateralUsd,
        collateralUsdRate: maybes([assets.collateral.balance, assets.collateral.balanceUsd], (balance, balanceUsd) =>
          balance ? balanceUsd / balance : undefined,
        ),
        borrowedUsdRate: maybes([assets.borrowed.balance, assets.borrowed.balanceUsd], (balance, balanceUsd) =>
          balance ? balanceUsd / balance : undefined,
        ),
      })),
    ),
    maxLeverage: fallbackQ(
      mapQuery(maxLeverage, value => ({ value })),
      mapQuery(apiMarket, ({ leverage }) => maybe(leverage, value => ({ value }))),
    ),
    availableLiquidity: fallbackQ(
      mapQuery(capAndAvailable, ({ available, totalAssets, borrowCap }) => ({
        available,
        totalAssets,
        borrowCap,
        borrowSymbol: borrowToken?.symbol,
      })),
      mapQuery(apiMarket, ({ debtCeiling, liquidityUsd }) => ({
        available: decimal(liquidityUsd),
        totalAssets: maybe(debtCeiling, decimal),
        borrowCap: maybe(debtCeiling, decimal),
        borrowSymbol: borrowToken?.symbol,
      })),
    ),
    totalBorrowers: fallbackQ(
      mapQuery(marketUsers, ({ count }) => ({ value: count })),
      mapQuery(apiMarket, ({ loans }) => ({ value: loans })),
    ),
    borrowedUsdRate: q(borrowedUsdRate),
    tvl,
    ...(marketType === LlamaMarketType.Lend && {
      solvency: mapQuery(solvency, ({ solvencyPercent, badDebtUsd }) => ({ value: solvencyPercent, badDebtUsd })),
    }),
  }
}
