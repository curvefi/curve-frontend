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
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { mapQuery, q } from '@ui-kit/types/util'
import { getPageCount } from '@ui-kit/utils'
import { LlammaActivityProps } from '..'

export const useLlammaActivityEventsConfig = ({
  isMarketAvailable,
  network,
  collateralToken,
  borrowToken,
  ammAddress,
  endpoint,
  networkConfig,
}: LlammaActivityProps) => {
  const { eventsColumnVisibility } = useLlammaActivityVisibility()
  const { pagination, onPaginationChange, apiPage } = useManualPagination()

  const eventsQuery = useLlammaEvents({
    chain: network,
    llamma: ammAddress,
    endpoint,
    page: apiPage,
    perPage: DEFAULT_PAGE_SIZE,
  })

  const pageCount = getPageCount(eventsQuery.data?.count, DEFAULT_PAGE_SIZE)

  // Transform events data with block explorer URLs
  const eventsWithUrlsQuery = mapQuery(
    eventsQuery,
    ({ events }) =>
      network &&
      events.map((event: LlammaEvent) => ({
        ...event,
        providerUrl: scanAddressPath(networkConfig, event.provider),
        txUrl: scanTxPath(networkConfig, event.txHash),
        network,
        collateralToken,
        borrowToken,
      })),
  )

  const table = useTable({
    query: q({
      data: eventsWithUrlsQuery.data,
      isLoading: eventsWithUrlsQuery.isLoading || !isMarketAvailable,
      error: isMarketAvailable ? eventsWithUrlsQuery.error : null,
    }),
    columns: LLAMMA_EVENTS_COLUMNS,
    state: { columnVisibility: eventsColumnVisibility, pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
    ...getTableOptions<LlammaEventRow>(eventsWithUrlsQuery.data),
  })

  return {
    table,
    emptyTitle: t`No activity data found.`,
    errorTitle: t`Could not load activity data.`,
  }
}
