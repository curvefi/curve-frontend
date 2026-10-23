import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useProcessedBandsData } from '@/llamalend/features/bands-chart/hooks/useProcessedBandsData'
import type { FetchedBandsBalances } from '@/llamalend/queries/bands/bands-balances.query-helpers'
import { useMarketBandsBalances } from '@/llamalend/queries/bands/market-bands-balances.query'
import { useUserBandsBalances } from '@/llamalend/queries/bands/user-bands-balances.query'
import { useMarketLiquidationBand } from '@/llamalend/queries/market/market-liquidation-band.query'
import { useMarketOraclePrice } from '@/llamalend/queries/market/market-oracle-price.query'
import { useLoanExists } from '@/llamalend/queries/user/user-loan-exists.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { combineQueryState } from '@ui/features/queries/combine'
import { q } from '@ui/features/queries/util'

const EMPTY_BANDS: FetchedBandsBalances[] = []

export const useBandsData = ({
  chainId,
  marketId,
  enabled = true,
}: {
  chainId: IChainId
  marketId: string | undefined
  enabled?: boolean
}) => {
  const { address: userAddress } = useConnection()
  const loanExists = useLoanExists({ chainId, marketId, userAddress }, enabled)
  const liquidationBand = useMarketLiquidationBand({ chainId, marketId }, enabled)
  const userBands = useUserBandsBalances(
    { chainId, marketId, userAddress, loanExists: loanExists.data, liquidationBand: liquidationBand.data },
    enabled,
  )
  const marketBands = useMarketBandsBalances({ chainId, marketId, liquidationBand: liquidationBand.data }, enabled)
  const oraclePrice = useMarketOraclePrice({ chainId, marketId }, enabled)

  const chartData = useProcessedBandsData({ marketBandsBalances: marketBands.data, userBandsBalances: userBands.data })
  const userBandsBalances = userBands.data ?? EMPTY_BANDS
  const data = useMemo(
    () => ({ chartData, userBandsBalances, oraclePrice: oraclePrice.data }),
    [chartData, userBandsBalances, oraclePrice.data],
  )
  const { isLoading } = combineQueryState(loanExists, liquidationBand, userBands, marketBands, oraclePrice)

  return useMemo(() => q({ data, isLoading, error: marketBands.error }), [data, isLoading, marketBands.error])
}
