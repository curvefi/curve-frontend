import { useAccount } from 'wagmi'
import { LlamaMarketColumnId } from '@/loan/components/PageLlamaMarkets/columns.enum'
import { useUserLendingSupplies, useUserLendingVaultStats } from '@/loan/entities/lending-vaults'
import { type LlamaMarket, LlamaMarketType } from '@/loan/entities/llama-markets'
import { useUserMintMarketStats } from '@/loan/entities/mint-markets'

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
  const { type, userHasPosition, address: marketAddress, controllerAddress, chain } = market
  const { address: userAddress } = useAccount()

  const enableStats = !!userHasPosition?.lend && (!column || statsColumns.includes(column))
  const enableEarnings = !!userHasPosition?.borrow && column != null && earningsColumns.includes(column)

  const enableLendingStats = enableStats && type === LlamaMarketType.Lend
  const enableMintStats = enableStats && type === LlamaMarketType.Mint

  const params = { userAddress, contractAddress: controllerAddress, blockchainId: chain }
  // todo: api will be updated to use controller address for earnings too
  const earningsParams = { ...params, contractAddress: marketAddress }

  const { data: lendData, error: lendError } = useUserLendingVaultStats(params, enableLendingStats)
  const { data: earnData, error: earnError } = useUserLendingSupplies(earningsParams, enableEarnings)
  const { data: mintData, error: mintError } = useUserMintMarketStats(params, enableMintStats)

  const stats = (enableLendingStats && lendData) || (enableMintStats && mintData)
  const earnings = enableEarnings && earnData?.[chain][earningsParams.contractAddress]
  const error = (enableLendingStats && lendError) || (enableMintStats && mintError) || (enableEarnings && earnError)
  return {
    ...(stats && {
      data: {
        isCollateralEroded: stats.softLiquidation && stats.debt > 0,
        health: stats.healthFull,
        borrowed: stats.debt,
      },
    }),
    ...(earnings && { data: { earnings } }),
    ...(error && { error }),
  }
}
