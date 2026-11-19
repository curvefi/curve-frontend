import { getActivityToken } from '@/llamalend/llama.utils'
import { useLlammaTrades } from '@/llamalend/queries/llamma-trades.query'
import { ACTIVITY_COLUMNS } from '@evm-ui/features/activity-table/columns/columns.definitions'
import { useActivityVisibility } from '@evm-ui/features/activity-table/hooks/useActivityVisibility'
import { useManualPagination } from '@evm-ui/features/activity-table/hooks/useManualPagination'
import { DEFAULT_PAGE_SIZE } from '@evm-ui/features/activity-table/utils'
import { getPageCount } from '@evm-ui/utils'
import { maybe } from '@primitives/objects.utils'
import { mapQuery, q } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'
import type { MarketActivityProps } from '../types'
import { toMarketActivitySwapRow } from '../utils'

export const useMarketActivitySwapsTable = ({ chainId, blockchainId, ammAddress, endpoint }: MarketActivityProps) => {
  const columnVisibility = useActivityVisibility({ hasValue: true })
  const { pagination, onPaginationChange, apiPage } = useManualPagination()

  const tradesQuery = useLlammaTrades({
    blockchainId,
    llamma: ammAddress,
    endpoint,
    page: apiPage,
    perPage: DEFAULT_PAGE_SIZE,
  })

  const pageCount = getPageCount(tradesQuery.data?.count, DEFAULT_PAGE_SIZE)

  const activityQuery = mapQuery(tradesQuery, ({ trades }) =>
    maybe(blockchainId, blockchainId =>
      trades.map(trade =>
        toMarketActivitySwapRow({
          ...trade,
          chainId,
          blockchainId,
          tokenBought: getActivityToken(blockchainId, trade.tokenBought) ?? trade.tokenBought,
          tokenSold: getActivityToken(blockchainId, trade.tokenSold) ?? trade.tokenSold,
        }),
      ),
    ),
  )

  const table = useCurveTable({
    query: q({
      data: activityQuery.data,
      isLoading: activityQuery.isLoading || !ammAddress,
      error: ammAddress ? activityQuery.error : null,
    }),
    columns: ACTIVITY_COLUMNS,
    state: { columnVisibility, pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
  })

  return { table, emptyState: { title: t`No swap data found.` }, errorState: { title: t`Could not load swap data.` } }
}
