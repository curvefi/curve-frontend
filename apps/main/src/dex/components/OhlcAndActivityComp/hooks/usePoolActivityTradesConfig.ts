import { useCallback } from 'react'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolTrades } from '@/dex/entities/pool-trades.query'
import { usePoolPricesApi } from '@/dex/queries/pools-prices-api.query'
import { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import { getPoolAddress } from '@/dex/utils'
import { getBlockchainId } from '@curvefi/prices-api'
import {
  POOL_TRADES_COLUMNS,
  usePoolActivityVisibility,
  useManualPagination,
  DEFAULT_PAGE_SIZE,
} from '@evm-ui/features/activity-table'
import { t } from '@evm-ui/lib/i18n'
import { useCombinedQueries } from '@evm-ui/lib/queries/combine'
import { useCurveTable } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { mapQuery, type QueryProp } from '@evm-ui/types/util'
import { getPageCount } from '@evm-ui/utils'
import { scanAddressPath, scanTxPath } from '@legacy-ui/utils'

type UsePoolActivityProps = {
  chainId: ChainId
  poolQuery: QueryProp<PoolDataCacheOrApi | undefined>
}

/**
 * Hook to manage pool activity data for the ActivityTable component.
 * Handles fetching, transforming, and providing table configurations for pool trade events.
 */
export const usePoolActivityTradesConfig = ({ chainId, poolQuery }: UsePoolActivityProps) => {
  const poolAddress = getPoolAddress(poolQuery.data)
  const { data: networkConfig } = useNetworkByChain({ chainId })
  const network = getBlockchainId(networkConfig?.id)
  const { pagination, onPaginationChange, apiPage } = useManualPagination()

  const poolPriceApi = usePoolPricesApi({ blockchainId: network, poolAddress })

  const { data: poolTokens = [] } = mapQuery(poolPriceApi, pool => pool.coins)
  const { tradesColumnVisibility } = usePoolActivityVisibility({ poolTokens })

  const poolTrades = usePoolTrades({
    chain: network,
    poolAddress,
    page: apiPage,
    perPage: DEFAULT_PAGE_SIZE,
  })
  const { data: tradesData } = poolTrades

  const pageCount = getPageCount(tradesData?.count, DEFAULT_PAGE_SIZE)

  // Transform trades data with block explorer URLs
  const tradesWithUrls = useCombinedQueries(
    [poolQuery, poolTrades, poolPriceApi],
    useCallback(
      (poolData, tradesData) =>
        poolData &&
        network &&
        tradesData.trades.map(trade => ({
          ...trade,
          buyerUrl: scanAddressPath(networkConfig, trade.buyer),
          txUrl: scanTxPath(networkConfig, trade.txHash),
          network,
        })),
      [networkConfig, network],
    ),
  )

  const table = useCurveTable({
    query: tradesWithUrls,
    columns: POOL_TRADES_COLUMNS,
    state: { columnVisibility: tradesColumnVisibility, pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
  })

  return {
    table,
    emptyState: { title: t`No swap data found.` },
    errorState: { title: t`Could not load swap data.` },
  }
}
