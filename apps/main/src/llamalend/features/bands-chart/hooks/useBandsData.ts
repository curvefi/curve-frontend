import { useConnection } from 'wagmi'
import { useProcessedBandsData } from '@/llamalend/features/bands-chart/hooks/useProcessedBandsData'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useMarketBandsBalances, useUserBandsBalances } from '@/llamalend/queries/bands'
import { useMarketLiquidationBand, useMarketOraclePrice } from '@/llamalend/queries/market'
import { useLoanExists } from '@/llamalend/queries/user'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { combineQueries } from '@ui-kit/lib'
import type { QueryProp } from '@ui-kit/types/util'

export const useBandsData = ({
  chainId,
  marketQuery,
  enabled = true,
}: {
  chainId: IChainId
  marketQuery: QueryProp<LlamaMarketTemplate>
  enabled?: boolean
}) => {
  const { address: userAddress } = useConnection()
  const marketId = marketQuery.data?.id
  const loanExists = useLoanExists({ chainId, marketId, userAddress }, enabled)
  const liquidationBand = useMarketLiquidationBand({ chainId, marketId }, enabled)
  const userBandsBalances = useUserBandsBalances(
    { chainId, marketId, userAddress, loanExists: loanExists.data, liquidationBand: liquidationBand.data },
    enabled,
  )
  const oraclePrice = useMarketOraclePrice({ chainId, marketId }, enabled)
  const processedChartData = useProcessedBandsData({
    marketBandsBalances: useMarketBandsBalances({ chainId, marketId, liquidationBand: liquidationBand.data }, enabled),
    userBandsBalances,
  })

  return combineQueries(
    [processedChartData, userBandsBalances, oraclePrice, liquidationBand, loanExists, marketQuery],
    (chartData, userBandsBalances, oraclePrice) => ({ chartData, userBandsBalances, oraclePrice }),
  )
}
