import { useLlammaEvents } from '@/llamalend/queries/llamma-events.query'
import type { LlammaEvent } from '@curvefi/prices-api/llamma'
import { scanAddressPath, scanTxPath } from '@ui/utils'
import {
  type LlammaEventRow,
  LLAMMA_EVENTS_COLUMNS,
  useLlammaActivityVisibility,
  useManualPagination,
  DEFAULT_PAGE_SIZE,
} from '@ui-kit/features/activity-table'
import { combineQueries } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { fakeLoadingQ } from '@ui-kit/types/util'
import { getPageCount } from '@ui-kit/utils'
import { LlammaActivityProps } from '..'

export const useLlammaActivityEventsConfig = ({
  network: chain,
  collateralToken,
  borrowToken,
  ammAddress: llamma,
  endpoint,
  networkConfig,
}: LlammaActivityProps) => {
  const { eventsColumnVisibility } = useLlammaActivityVisibility()
  const { pagination, onPaginationChange, apiPage: page } = useManualPagination()

  const eventsQuery = useLlammaEvents({ chain, llamma, endpoint, page, perPage: DEFAULT_PAGE_SIZE })

  // Transform events data with block explorer URLs
  const query = combineQueries(
    [eventsQuery, fakeLoadingQ(llamma)],
    ({ events }) =>
      chain &&
      events.map((event: LlammaEvent) => ({
        ...event,
        providerUrl: scanAddressPath(networkConfig, event.provider),
        txUrl: scanTxPath(networkConfig, event.txHash),
        network: chain,
        collateralToken,
        borrowToken,
      })),
  )

  return {
    table: useTable({
      query,
      columns: LLAMMA_EVENTS_COLUMNS,
      state: { columnVisibility: eventsColumnVisibility, pagination },
      manualPagination: true,
      pageCount: getPageCount(eventsQuery.data?.count, DEFAULT_PAGE_SIZE),
      onPaginationChange,
      ...getTableOptions<LlammaEventRow>(query.data),
    }),
    emptyMessage: t`No activity data found.`,
    errorMessage: t`Could not load activity data.`,
  }
}
