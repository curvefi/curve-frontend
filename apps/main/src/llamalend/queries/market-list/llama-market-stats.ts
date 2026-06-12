import { useConnection } from 'wagmi'
import { LlamaMarketColumnId } from '@/llamalend/features/market-list/columns'
import { calculateLtv, getDisplayHealth, getLiquidationStatus, isBelowRange } from '@/llamalend/llama.utils'
import { useUserLendingVaultStats } from '@/llamalend/queries/market-list/lending-vaults'
import { type LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { useUserMintMarketStats } from '@/llamalend/queries/market-list/mint-markets'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LlamaMarketType } from '@ui-kit/types/market'
import { requireChainId } from '@ui-kit/utils'
import { decimal } from '@ui-kit/utils/decimal'

const statsColumns = [
  LlamaMarketColumnId.UserHealth,
  LlamaMarketColumnId.UserBorrowed,
  LlamaMarketColumnId.UserCollateral,
  LlamaMarketColumnId.UserLtv,
]

/**
 * Hook that fetches the user's stats for a given market.
 * Depending on the column and market type, it fetches the stats from different endpoints.
 * It returns the stats data and an error if any.
 * @returns The stats data and an error if any
 */
export function useUserMarketStats(
  { assets, type, userHasPositions, controllerAddress, chain }: LlamaMarket,
  column?: LlamaMarketColumnId,
) {
  const { address: userAddress } = useConnection()
  const { data: collateralUsdRate, isLoading: collateralUsdRateLoading } = useTokenUsdRate({
    chainId: requireChainId(chain),
    tokenAddress: assets.collateral.address,
  })
  const { data: borrowedUsdRate, isLoading: borrowedUsdRateLoading } = useTokenUsdRate({
    chainId: requireChainId(chain),
    tokenAddress: assets.borrowed.address,
  })

  const enableStats = !!userHasPositions?.Borrow && (!column || statsColumns.includes(column))
  const enableLendingStats = enableStats && type === LlamaMarketType.Lend
  const enableMintStats = enableStats && type === LlamaMarketType.Mint

  const params = { userAddress, contractAddress: controllerAddress, blockchainId: chain }

  const {
    data: lendData,
    error: lendError,
    isLoading: loadingLend,
  } = useUserLendingVaultStats(params, enableLendingStats)

  const { data: mintData, error: mintError, isLoading: loadingMint } = useUserMintMarketStats(params, enableMintStats)

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule.
  const stats = (enableLendingStats && lendData) || (enableMintStats && mintData)
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule.
  const error = (enableLendingStats && lendError) || (enableMintStats && mintError)
  const isLoading = loadingLend || loadingMint || collateralUsdRateLoading || borrowedUsdRateLoading

  const borrowedAmount = stats ? ('borrowed' in stats ? stats.borrowed : stats.stablecoin) : 0

  return {
    ...(stats && {
      data: {
        status: getLiquidationStatus(
          decimal(stats.health),
          stats.softLiquidation,
          isBelowRange(stats.activeBand, stats.n2),
          decimal(stats.collateral),
          decimal(borrowedAmount),
        ),
        health: getDisplayHealth(stats.healthFull, stats.health),
        borrowed: stats.debt,
        collateral: {
          amount: stats.collateral,
          address: assets?.collateral?.address,
          symbol: assets?.collateral?.symbol,
          usdRate: collateralUsdRate,
        },
        /**
         * This is also collateral, namely when the user gets soft liq and
         * part of the collateral gets converted into the borrow token.
         */
        borrowToken: {
          amount: borrowedAmount,
          address: assets?.borrowed?.address,
          symbol: assets?.borrowed?.symbol,
          usdRate: borrowedUsdRate,
        },
        ltv: calculateLtv(stats.debt, stats.collateral, borrowedAmount, borrowedUsdRate, collateralUsdRate),
        collateralLoss: {
          depositedCollateral: decimal(stats.totalDeposited),
          currentCollateralEstimation: decimal(stats.collateral),
          percentage: decimal(stats.lossPct),
          amount: decimal(stats.loss),
        },
      },
    }),
    ...(error && { error }),
    isLoading,
  }
}

export type MarketStats = ReturnType<typeof useUserMarketStats>['data']
