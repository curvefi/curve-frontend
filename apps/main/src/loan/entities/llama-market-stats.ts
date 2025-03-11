import { LlamaMarketColumnId } from '@/loan/components/PageLlamaMarkets/columns.enum'
import { useUserLendingVaultEarnings, useUserLendingVaultStats } from '@/loan/entities/lending-vaults'
import { type LlamaMarket, LlamaMarketType } from '@/loan/entities/llama-markets'
import { useUserMintMarketStats } from '@/loan/entities/mint-markets'
import { useWallet } from '@ui-kit/features/connect-wallet'

const statsColumns = [
  LlamaMarketColumnId.UserHealth,
  LlamaMarketColumnId.UserBorrowed,
  LlamaMarketColumnId.UserDeposited,
]

export function useUserMarketStats(market: LlamaMarket, column?: LlamaMarketColumnId) {
  const { type, userHasPosition, address, controllerAddress, chain } = market
  const { signerAddress } = useWallet()

  const enableStats = userHasPosition && (!column || statsColumns.includes(column))
  const enableEarnings = userHasPosition && column === LlamaMarketColumnId.UserEarnings

  const enableLendingStats = enableStats && type === LlamaMarketType.Lend
  const enableLendEarnings = enableEarnings && type === LlamaMarketType.Lend
  const enableMintStats = enableStats && type === LlamaMarketType.Mint

  // todo: api will be updated to use controller address for earnings too
  const params = {
    userAddress: signerAddress,
    contractAddress: enableEarnings ? address : controllerAddress,
    blockchainId: chain,
  }

  const { data: lendData, error: lendError } = useUserLendingVaultStats(params, enableLendingStats)
  const { data: earnData, error: earnError } = useUserLendingVaultEarnings(params, enableLendEarnings)
  const { data: mintData, error: mintError } = useUserMintMarketStats(params, enableMintStats)

  const stats = lendData ?? mintData
  const error = (enableLendingStats && lendError) || (enableMintStats && mintError) || (enableEarnings && earnError)

  error &&
    console.log({
      type,
      column,
      enableLendingStats,
      enableLendEarnings,
      enableMintStats,
      stats,
      error,
      earnData,
    })

  return {
    ...(stats && {
      data: {
        isCollateralEroded: stats.softLiquidation,
        health: stats.healthFull,
        borrowed: stats.debt,
        deposited: stats.totalDeposited,
      },
    }),
    ...(earnData && { data: { earnings: earnData.earnings } }),
    ...(error && { error }),
  }
}
