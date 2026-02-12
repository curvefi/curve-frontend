import { useConnection } from 'wagmi'
import { LlamaMarketColumnId } from '@/llamalend/features/market-list/columns'
import { calculateLtv } from '@/llamalend/llama.utils'
import { useUserLendingVaultEarnings, useUserLendingVaultStats } from '@/llamalend/queries/market-list/lending-vaults'
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
const earningsColumns = [
  LlamaMarketColumnId.UserEarnings,
  LlamaMarketColumnId.UserDeposited,
  LlamaMarketColumnId.UserBoostMultiplier,
]

/**
 * Hook that fetches the user's stats for a given market.
 * Depending on the column and market type, it fetches the stats from different endpoints.
 * It returns the stats data and an error if any.
 * @param market - The market to fetch stats for
 * @param column - The column to fetch stats for
 * @returns The stats data and an error if any
 */
export function useUserMarketStats(market: LlamaMarket, column?: LlamaMarketColumnId) {
  const { type, userHasPositions, controllerAddress, vaultAddress, chain, onchainUserStats } = market
  const enableStats = !!userHasPositions?.Borrow && (!column || statsColumns.includes(column))
  const enableEarnings = !!userHasPositions?.Supply && column != null && earningsColumns.includes(column)
  const { address: userAddress } = useConnection()
  const { data: collateralUsdRate, isLoading: collateralUsdRateLoading } = useTokenUsdRate(
    {
      chainId: requireChainId(market.chain),
      tokenAddress: market.assets.collateral.address,
    },
    enableStats,
  )
  const { data: borrowedUsdRate, isLoading: borrowedUsdRateLoading } = useTokenUsdRate(
    {
      chainId: requireChainId(market.chain),
      tokenAddress: market.assets.borrowed.address,
    },
    enableStats,
  )
  const hasOnchainBorrowStats =
    enableStats &&
    onchainUserStats?.health != null &&
    onchainUserStats?.debt != null &&
    onchainUserStats?.collateral != null &&
    onchainUserStats?.borrowed != null

  const enableLendingStats = enableStats && !hasOnchainBorrowStats && type === LlamaMarketType.Lend
  const enableMintStats = enableStats && !hasOnchainBorrowStats && type === LlamaMarketType.Mint

  const params = { userAddress, contractAddress: controllerAddress, blockchainId: chain }

  const {
    data: lendData,
    error: lendError,
    isLoading: loadingLend,
  } = useUserLendingVaultStats(params, enableLendingStats)

  // The API endpoint for user earnings is an exception in that it relies on the vault address instead of controller address.
  const {
    data: earnData,
    error: earnError,
    isLoading: loadingEarn,
  } = useUserLendingVaultEarnings({ ...params, contractAddress: vaultAddress }, enableEarnings)

  const { data: mintData, error: mintError, isLoading: loadingMint } = useUserMintMarketStats(params, enableMintStats)

  const onchainStats = hasOnchainBorrowStats
    ? {
        softLiquidation: !!onchainUserStats.softLiquidation,
        healthFull: onchainUserStats.health ?? 0,
        debt: onchainUserStats.debt ?? 0,
        collateral: onchainUserStats.collateral ?? 0,
        borrowed: onchainUserStats.borrowed ?? 0,
        totalDeposited: 0,
        lossPct: 0,
        loss: 0,
      }
    : undefined

  const stats = onchainStats ?? ((enableLendingStats && lendData) || (enableMintStats && mintData))
  const earnings = enableEarnings && earnData
  const error = (enableLendingStats && lendError) || (enableMintStats && mintError) || (enableEarnings && earnError)
  const isLoading =
    (enableLendingStats && loadingLend) ||
    (enableMintStats && loadingMint) ||
    (enableEarnings && loadingEarn) ||
    collateralUsdRateLoading ||
    borrowedUsdRateLoading

  const borrowedAmount = stats
    ? 'borrowed' in stats
      ? stats.borrowed
      : 'stablecoin' in stats
        ? stats.stablecoin
        : 0
    : 0

  return {
    ...(stats && {
      data: {
        softLiquidation: stats.softLiquidation,
        liquidated: stats.healthFull < 0 && borrowedAmount === 0,
        health: stats.healthFull,
        borrowed: stats.debt,
        collateral: {
          amount: stats.collateral,
          address: market?.assets?.collateral?.address,
          symbol: market?.assets?.collateral?.symbol,
          usdRate: collateralUsdRate,
        },
        /**
         * This is also collateral, namely when the user gets soft liq and
         * part of the collateral gets converted into the borrow token.
         */
        borrowToken: {
          amount: borrowedAmount,
          address: market?.assets?.borrowed?.address,
          symbol: market?.assets?.borrowed?.symbol,
          usdRate: borrowedUsdRate,
        },
        ltv: calculateLtv(stats.debt, stats.collateral, borrowedAmount, borrowedUsdRate, collateralUsdRate),
        collateralLoss: {
          depositedCollateral: decimal(stats.totalDeposited ?? 0),
          currentCollateralEstimation: decimal(stats.collateral),
          percentage: decimal(stats.lossPct ?? 0),
          amount: decimal(stats.loss ?? 0),
        },
      },
    }),
    ...(enableEarnings && { data: { earnings } }),
    ...(error && { error }),
    isLoading,
  }
}
