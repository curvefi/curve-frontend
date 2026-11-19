import { getActivityToken } from '@/llamalend/llama.utils'
import { useLlammaEvents } from '@/llamalend/queries/llamma-events.query'
import { ACTIVITY_COLUMNS } from '@evm-ui/features/activity-table/columns/columns.definitions'
import { useActivityVisibility } from '@evm-ui/features/activity-table/hooks/useActivityVisibility'
import { useManualPagination } from '@evm-ui/features/activity-table/hooks/useManualPagination'
import { DEFAULT_PAGE_SIZE } from '@evm-ui/features/activity-table/utils'
import { getPageCount } from '@evm-ui/utils'
import { combineQueries } from '@ui/features/queries/combine'
import { loadingQ } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'
import type { MarketBorrowActivityProps } from '../types'
import { toMarketActivityBorrowEventRow } from '../utils'

export const useMarketActivityBorrowEventsTable = ({
  chainId,
  blockchainId,
  collateralToken,
  borrowToken,
  ammAddress: llamma,
  endpoint,
}: MarketBorrowActivityProps) => {
  const columnVisibility = useActivityVisibility({ hasValue: true })
  const { pagination, onPaginationChange, apiPage: page } = useManualPagination()

  const eventsQuery = useLlammaEvents({ blockchainId, llamma, endpoint, page, perPage: DEFAULT_PAGE_SIZE })

  const query = combineQueries([eventsQuery, loadingQ(llamma)], ({ events }) =>
    events.map(event =>
      toMarketActivityBorrowEventRow({
        ...event,
        chainId,
        blockchainId,
        collateralToken: getActivityToken(blockchainId, collateralToken),
        borrowToken: getActivityToken(blockchainId, borrowToken),
      }),
    ),
  )

  return {
    table: useCurveTable({
      query,
      columns: ACTIVITY_COLUMNS,
      state: { columnVisibility, pagination },
      manualPagination: true,
      pageCount: getPageCount(eventsQuery.data?.count, DEFAULT_PAGE_SIZE),
      onPaginationChange,
    }),
    emptyState: { title: t`No activity data found.` },
    errorState: { title: t`Could not load activity data.` },
  }
}
