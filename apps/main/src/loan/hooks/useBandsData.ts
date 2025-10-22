import { useMemo } from 'react'
import { useProcessedBandsData } from '@/llamalend/features/bands-chart/hooks/useBandsData'
import { useMarketBands } from '@/llamalend/features/bands-chart/queries/market-bands.query'
import { useMarketOraclePrices } from '@/llamalend/features/bands-chart/queries/market-oracle-prices.query'
import { useUserBands } from '@/llamalend/features/bands-chart/queries/user-bands.query'
import { BandsBalancesData } from '@/llamalend/features/bands-chart/types'
import { useLoanExists } from '@/llamalend/queries/loan-exists'
import type { LlamaApi } from '@ui-kit/features/connect-wallet'

export const useBandsData = ({
  chainId,
  llammaId,
  api,
}: {
  chainId: number
  llammaId: string
  api: LlamaApi | undefined
}) => {
  const { data: marketBands } = useMarketBands({ chainId, marketId: llammaId })
  const { data: marketOraclePrices } = useMarketOraclePrices({ chainId, marketId: llammaId })
  const { data: loanExists } = useLoanExists({ chainId, marketId: llammaId, userAddress: api?.signerAddress })
  const { data: userBands } = useUserBands({
    chainId,
    marketId: llammaId,
    userAddress: api?.signerAddress,
    loanExists: loanExists,
  })

  const marketBandsBalances = marketBands?.bandsBalances
  const liquidationBand = marketBands?.liquidationBand

  const { oraclePrice, oraclePriceBand } = marketOraclePrices ?? {}

  const normalizedMarketBands = useMemo(
    () =>
      marketBandsBalances?.map((band: BandsBalancesData) => ({
        ...band,
        borrowed: band.stablecoin ?? '0',
        collateralUsd: String(band.collateralStablecoinUsd ?? 0),
      })) ?? [],
    [marketBandsBalances],
  )

  const normalizedUserBands = useMemo(
    () =>
      userBands?.map((band: BandsBalancesData) => ({
        ...band,
        borrowed: band.stablecoin ?? '0',
        collateralUsd: String(band.collateralStablecoinUsd ?? 0),
      })) ?? [],
    [userBands],
  )

  const chartData = useProcessedBandsData({
    marketBandsBalances: normalizedMarketBands,
    userBandsBalances: normalizedUserBands,
    oraclePriceBand,
  })

  return {
    chartData,
    userBands,
    liquidationBand,
    oraclePrice,
    oraclePriceBand,
  }
}
