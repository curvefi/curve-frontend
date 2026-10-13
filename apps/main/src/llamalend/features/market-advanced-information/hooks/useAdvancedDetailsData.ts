import { useSolvencyMarket } from '@/llamalend/hooks/useSolvencyMarket'
import { getControllerAddress } from '@/llamalend/llama.utils'
import { MarketTemplate } from '@/llamalend/llamalend.types'
import { useMarketMaxLeverage } from '@/llamalend/queries/market/market-max-leverage.query'
import { useMarketOverview } from '@/llamalend/queries/market/market-overview.query'
import { useMarketSnapshots } from '@/llamalend/queries/market/market-snapshots.query'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { getReturnOnEquity } from '@/llamalend/rates.utils'
import type { MarketParams } from '@evm-ui/queries/query-types'
import { MarketType } from '@evm-ui/types/market'
import { requireBlockchainId } from '@evm-ui/utils/network'
import { maybe } from '@primitives/objects.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { fallbackQ, mapQuery, q, type QueryProp } from '@ui/features/queries/util'

const maxReturnOnEquity = (leverage: number | null, collateralApy: number | null, borrowApy: number | null) => ({
  value: getReturnOnEquity(leverage, collateralApy, borrowApy),
  leverage,
  collateralApy,
  borrowApy,
})

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
  const blockchainId = maybe(chainId, chainId => requireBlockchainId(chainId))
  const controllerAddress = getControllerAddress(market, apiMarket.data)
  const isControllerLoading = !controllerAddress && (marketQuery.isLoading || apiMarket.isLoading)
  const marketOverviewQuery = useMarketOverview({ blockchainId, controllerAddress, marketType })
  const marketOverview = q({ ...marketOverviewQuery, isLoading: marketOverviewQuery.isLoading || isControllerLoading })

  const maxLeverage = useMarketMaxLeverage({ chainId, marketId, range: market?.minBands ?? 0 })
  const snapshots = useMarketSnapshots({ blockchainId, controllerAddress, marketType })
  const solvency = useSolvencyMarket({ blockchainId, controllerAddress, marketType })

  return {
    maxLeverage: fallbackQ(
      mapQuery(maxLeverage, value => ({ value })),
      mapQuery(apiMarket, ({ leverage }) => maybe(leverage, value => ({ value }))),
    ),
    maxReturnOnEquity: fallbackQ(
      combineQueries([maxLeverage, snapshots], (leverage, snapshots) =>
        maybe(snapshots.at(-1), ({ borrowApy, collateralToken }) =>
          maxReturnOnEquity(+leverage, collateralToken.rebasingYield, borrowApy),
        ),
      ),
      mapQuery(apiMarket, ({ leverage, assets, rates }) =>
        maxReturnOnEquity(leverage, assets.collateral.rebasingYield, rates.borrowApy),
      ),
    ),
    deployedDays: mapQuery(marketOverview, ({ deployedDays }) => deployedDays),
    ...(marketType === MarketType.Lend && {
      solvency: mapQuery(
        q({ ...solvency, isLoading: solvency.isLoading || isControllerLoading }),
        ({ solvencyPercent, badDebtUsd }) => ({ value: solvencyPercent, badDebtUsd }),
      ),
    }),
  }
}
