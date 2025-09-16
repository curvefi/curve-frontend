import { useAccount } from 'wagmi'
import { useUserLendingVaultEarnings, useUserLendingVaultStats } from '@/llamalend/entities/lending-vaults'
import { type LlamaMarket } from '@/llamalend/entities/llama-markets'
import { useUserMintMarketStats } from '@/llamalend/entities/mint-markets'
import { LlamaMarketColumnId } from '@/llamalend/features/market-list/columns.enum'
import { LlamaMarketType } from '@ui-kit/types/market'

const statsColumns = [LlamaMarketColumnId.UserHealth, LlamaMarketColumnId.UserBorrowed]
const earningsColumns = [LlamaMarketColumnId.UserEarnings, LlamaMarketColumnId.UserDeposited]

/**
 * Hook that fetches the user's stats for a given market.
 * Depending on the column and market type, it fetches the stats from different endpoints.
 * It returns the stats data and an error if any.
 * @param market - The market to fetch stats for
 * @param column - The column to fetch stats for
 * @returns The stats data and an error if any
 */
export function useUserMarketStats(market: LlamaMarket, column?: LlamaMarketColumnId) {
  const { type, userHasPositions, address: marketAddress, controllerAddress, chain } = market
  const { address: userAddress } = useAccount()

  const enableStats = !!userHasPositions?.Borrow && (!column || statsColumns.includes(column))
  const enableEarnings = !!userHasPositions?.Supply && column != null && earningsColumns.includes(column)

  const enableLendingStats = enableStats && type === LlamaMarketType.Lend
  const enableMintStats = enableStats && type === LlamaMarketType.Mint

  const params = { userAddress, contractAddress: controllerAddress, blockchainId: chain }
  // todo: api will be updated to use controller address for earnings too
  const earningsParams = { ...params, contractAddress: marketAddress }

  const {
    data: lendData,
    error: lendError,
    isLoading: loadingLend,
  } = useUserLendingVaultStats(params, enableLendingStats)

  const {
    data: earnData,
    error: earnError,
    isLoading: loadingEarn,
  } = useUserLendingVaultEarnings(earningsParams, enableEarnings)

  const { data: mintData, error: mintError, isLoading: loadingMint } = useUserMintMarketStats(params, enableMintStats)

  const stats = (enableLendingStats && lendData) || (enableMintStats && mintData)
  const error = (enableLendingStats && lendError) || (enableMintStats && mintError) || (enableEarnings && earnError)
  const isLoading = loadingLend || loadingEarn || loadingMint

  return {
    ...(stats && {
      data: {
        softLiquidation: stats.softLiquidation,
        isCollateralEroded: stats.softLiquidation && stats.debt > 0,
        health: stats.healthFull,
        borrowed: stats.debt,
      },
    }),
    ...(enableEarnings && { data: { earnings: earnData } }),
    ...(error && { error }),
    isLoading,
  }
}
