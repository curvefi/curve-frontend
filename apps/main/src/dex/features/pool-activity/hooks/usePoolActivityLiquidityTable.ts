import { useCallback } from 'react'
import { usePoolLiquidityEvents } from '@/dex/entities/pool-liquidity.query'
import { usePoolContext } from '@/dex/features/pool-context'
import { getPricesApiBlockchainId } from '@curvefi/prices-api'
import { ACTIVITY_COLUMNS } from '@evm-ui/features/activity-table/columns/columns.definitions'
import { useActivityVisibility } from '@evm-ui/features/activity-table/hooks/useActivityVisibility'
import { useManualPagination } from '@evm-ui/features/activity-table/hooks/useManualPagination'
import { DEFAULT_PAGE_SIZE } from '@evm-ui/features/activity-table/utils'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { getPageCount } from '@evm-ui/utils'
import { maybe } from '@primitives/objects.utils'
import { useCombinedQueries } from '@ui/features/queries/combine'
import { loadingQ } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'
import { toPoolActivityLiquidityRow } from '../utils'

/** Create an ActivityTable for pool liquidity events. */
export const usePoolActivityLiquidityTable = () => {
  const { chainId, blockchainId, poolAddress, apiPool } = usePoolContext()
  const { isHydrated } = useCurve()
  const network = getPricesApiBlockchainId(blockchainId)
  const { pagination, onPaginationChange, apiPage } = useManualPagination()

  const columnVisibility = useActivityVisibility({ hasValue: false })

  const poolLiquidityEvents = usePoolLiquidityEvents({
    blockchainId: network,
    poolAddress,
    page: apiPage,
    perPage: DEFAULT_PAGE_SIZE,
  })
  const { data: liquidityData } = poolLiquidityEvents

  const pageCount = getPageCount(liquidityData?.count, DEFAULT_PAGE_SIZE)

  const query = useCombinedQueries(
    [poolLiquidityEvents, apiPool, loadingQ(isHydrated || undefined)],
    useCallback(
      (liquidityData, { coins: poolTokens }) =>
        maybe(network, blockchainId =>
          liquidityData.events.map(event =>
            toPoolActivityLiquidityRow({ ...event, chainId, blockchainId, poolTokens }),
          ),
        ),
      [network, chainId],
    ),
  )

  const table = useCurveTable({
    query,
    columns: ACTIVITY_COLUMNS,
    state: { columnVisibility, pagination },
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
