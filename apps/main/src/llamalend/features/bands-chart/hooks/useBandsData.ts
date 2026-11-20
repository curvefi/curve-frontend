import { useConnection } from 'wagmi'
import { useProcessedBandsData } from '@/llamalend/features/bands-chart/hooks/useProcessedBandsData'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import { useMarketBandsBalances } from '@/llamalend/queries/bands/market-bands-balances.query'
import { useUserBandsBalances } from '@/llamalend/queries/bands/user-bands-balances.query'
import { useMarketLiquidationBand } from '@/llamalend/queries/market/market-liquidation-band.query'
import { useLoanExists } from '@/llamalend/queries/user/user-loan-exists.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { combineQueryState } from '@ui/features/queries/combine'
import { mapQuery, q, type QueryProp } from '@ui/features/queries/util'

export const useBandsData = ({
  chainId,
  market,
  enabled,
}: {
  chainId: IChainId
  market: QueryProp<MarketTemplate>
  enabled?: boolean
}) => {
  const marketId = mapQuery(market, m => m.id)
  const { address: userAddress } = useConnection()
  const loanExists = q(useLoanExists({ chainId, marketId, userAddress }, enabled))
  const liquidationBand = q(useMarketLiquidationBand({ chainId, marketId }, enabled))
  const userBands = useUserBandsBalances({ chainId, marketId, userAddress, loanExists, liquidationBand }, enabled)
  const marketBands = useMarketBandsBalances({ chainId, marketId, liquidationBand }, enabled)

  const chartData = useProcessedBandsData({ marketBandsBalances: marketBands.data, userBandsBalances: userBands.data })
  return q({ data: chartData, ...combineQueryState(market, loanExists, liquidationBand, userBands, marketBands) })
}
