import { useSolvencyMarket } from '@/llamalend/hooks/useSolvencyMarket'
import {
  calculateLendMarketTvlUsd,
  calculateMintMarketTvlUsd,
  getControllerAddress,
  getTokens,
  getVaultAddress,
} from '@/llamalend/llama.utils'
import { MarketTemplate } from '@/llamalend/llamalend.types'
import {
  useMarketCapAndAvailable,
  useMarketMaxLeverage,
  useMarketOverview,
  useMarketTotalCollateral,
  useMarketTotalSuppliers,
} from '@/llamalend/queries/market'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { combineQueries } from '@evm-ui/lib'
import { useTokenUsdRate } from '@evm-ui/lib/model/entities/token-usd-rate'
import type { MarketParams } from '@evm-ui/lib/model/query/root-keys'
import { MarketType } from '@evm-ui/types/market'
import { decimal } from '@evm-ui/utils'
import { requireBlockchainId } from '@evm-ui/utils/network'
import { maybe, maybes } from '@primitives/objects.utils'
import { fallbackQ, mapQuery, q, type QueryProp } from '@ui/features/queries/util'

export const useAdvancedDetailsData = ({
  chainId,
  marketQuery,
  marketId,
  marketType,
  apiMarket,
}: MarketParams & {
  marketQuery: QueryProp<MarketTemplate>
  marketType: MarketType
  apiMarket: QueryProp<LlamaMarket>
}) => {
  const market = marketQuery.data
  const { collateralToken, borrowToken } = getTokens(market, apiMarket.data) ?? {}
  const blockchainId = maybe(chainId, chainId => requireBlockchainId(chainId))
  const controllerAddress = getControllerAddress(market, apiMarket.data)
  const vaultAddress = getVaultAddress(market, apiMarket.data)
  const isControllerLoading = !controllerAddress && (marketQuery.isLoading || apiMarket.isLoading)
  const marketOverviewQuery = useMarketOverview({ blockchainId, controllerAddress, marketType })
  const marketOverview = q({
    ...marketOverviewQuery,
    isLoading: marketOverviewQuery.isLoading || isControllerLoading,
  })

  const maxLeverage = useMarketMaxLeverage({
    chainId,
    marketId,
    range: market?.minBands ?? 0,
  })
  const capAndAvailable = useMarketCapAndAvailable({ chainId, marketId })
  const totalCollateral = useMarketTotalCollateral({ chainId, marketId })
  const totalSuppliers = useMarketTotalSuppliers({ blockchainId, contractAddress: vaultAddress })
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
  const tvl = fallbackQ(
    marketType === MarketType.Lend
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
    totalBorrowers: mapQuery(marketOverview, ({ totalBorrowers }) => totalBorrowers),
    totalSuppliers: q(totalSuppliers),
    borrowedUsdRate: q(borrowedUsdRate),
    deployedDays: mapQuery(marketOverview, ({ deployedDays }) => deployedDays),
    tvl,
    ...(marketType === MarketType.Lend && {
      solvency: mapQuery(
        q({ ...solvency, isLoading: solvency.isLoading || isControllerLoading }),
        ({ solvencyPercent, badDebtUsd }) => ({ value: solvencyPercent, badDebtUsd }),
      ),
    }),
  }
}
