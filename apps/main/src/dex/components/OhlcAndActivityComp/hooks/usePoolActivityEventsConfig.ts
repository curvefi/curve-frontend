import { useCallback } from 'react'
import { usePoolLiquidityEvents } from '@/dex/entities/pool-liquidity.query'
import { usePoolContext } from '@/dex/features/pool-context'
import { getPricesApiBlockchainId } from '@curvefi/prices-api'
import { POOL_LIQUIDITY_COLUMNS } from '@evm-ui/features/activity-table/columns/pool-liquidity-columns'
import { useManualPagination } from '@evm-ui/features/activity-table/hooks/useManualPagination'
import { usePoolActivityVisibility } from '@evm-ui/features/activity-table/hooks/usePoolActivityVisibility'
import { DEFAULT_PAGE_SIZE } from '@evm-ui/features/activity-table/utils'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { getPageCount } from '@evm-ui/utils'
import { maybe } from '@primitives/objects.utils'
import { useCombinedQueries } from '@ui/features/queries/combine'
import { loadingQ } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'

/**
 * Hook to manage pool activity events data for the ActivityTable component.
 * Handles fetching, transforming, and providing table configurations for pool liquidity events.
 */
export const usePoolActivityEventsConfig = () => {
  const { chainId, blockchainId, poolAddress, apiPool } = usePoolContext()
  const { isHydrated } = useCurve()
  const network = getPricesApiBlockchainId(blockchainId)
  const { pagination, onPaginationChange, apiPage } = useManualPagination()

  const { liquidityColumnVisibility } = usePoolActivityVisibility()

  const poolLiquidityEvents = usePoolLiquidityEvents({
    blockchainId: network,
    poolAddress,
    page: apiPage,
    perPage: DEFAULT_PAGE_SIZE,
  })
  const { data: liquidityData } = poolLiquidityEvents

  const pageCount = getPageCount(liquidityData?.count, DEFAULT_PAGE_SIZE)

  // Transform liquidity data with block explorer URLs and pool tokens
  const liquidityWithUrls = useCombinedQueries(
    [poolLiquidityEvents, apiPool, loadingQ(isHydrated || undefined)],
    useCallback(
      (liquidityData, { coins: poolTokens }) =>
        maybe(network, blockchainId =>
          liquidityData.events.map(event => ({ ...event, chainId, blockchainId, poolTokens })),
        ),
      [network, chainId],
    ),
  )

  const table = useCurveTable({
    query: liquidityWithUrls,
    columns: POOL_LIQUIDITY_COLUMNS,
    state: { columnVisibility: liquidityColumnVisibility, pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
  })

  return {
    table,
    emptyState: { title: t`No liquidity data found.` },
    errorState: { title: t`Could not load liquidity data.` },
  }
}
