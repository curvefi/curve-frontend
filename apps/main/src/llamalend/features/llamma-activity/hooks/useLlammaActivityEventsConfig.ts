import { useLlammaEvents } from '@/llamalend/queries/llamma-events.query'
import type { LlammaEvent } from '@curvefi/prices-api/llamma'
import {
  LLAMMA_EVENTS_COLUMNS,
  useLlammaActivityVisibility,
  useManualPagination,
  DEFAULT_PAGE_SIZE,
} from '@evm-ui/features/activity-table'
import { combineQueries } from '@evm-ui/lib'
import { t } from '@evm-ui/lib/i18n'
import { useCurveTable } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { fakeLoadingQ } from '@evm-ui/types/util'
import { getPageCount } from '@evm-ui/utils'
import { scanAddressPath, scanTxPath } from '@legacy-ui/utils'
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
    table: useCurveTable({
      query,
      columns: LLAMMA_EVENTS_COLUMNS,
      state: { columnVisibility: eventsColumnVisibility, pagination },
      manualPagination: true,
      pageCount: getPageCount(eventsQuery.data?.count, DEFAULT_PAGE_SIZE),
      onPaginationChange,
    }),
    emptyState: { title: t`No activity data found.` },
    errorState: { title: t`Could not load activity data.` },
  }
}
