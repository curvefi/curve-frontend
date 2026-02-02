import { useMemo } from 'react'
import { useLlammaEvents } from '@/llamalend/queries/llamma-events.query'
import type { LlammaEvent } from '@curvefi/prices-api/llamma'
import { scanTxPath } from '@ui/utils'
import {
  type LlammaEventRow,
  LLAMMA_EVENTS_COLUMNS,
  useLlammaActivityVisibility,
  useManualPagination,
  getPageCount,
  DEFAULT_PAGE_SIZE,
} from '@ui-kit/features/activity-table'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
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
  const { isHydrated } = useCurve()
  const { eventsColumnVisibility } = useLlammaActivityVisibility()
  const { pagination, onPaginationChange, apiPage } = useManualPagination()

  const {
    data: eventsData,
    isLoading: isEventsLoading,
    isError: isEventsError,
  } = useLlammaEvents({
    chain: network,
    llamma: ammAddress,
    endpoint,
    page: apiPage,
    perPage: DEFAULT_PAGE_SIZE,
  })

  const pageCount = getPageCount(eventsData?.count, DEFAULT_PAGE_SIZE)

  // Transform events data with block explorer URLs
  const eventsWithUrls: LlammaEventRow[] = useMemo(
    () =>
      (network &&
        eventsData?.events.map((event: LlammaEvent) => ({
          ...event,
          txUrl: scanTxPath(networkConfig, event.txHash),
          network,
          collateralToken,
          borrowToken,
        }))) ??
      [],
    [eventsData?.events, network, networkConfig, collateralToken, borrowToken],
  )

  const isLoading = isEventsLoading || !isHydrated || !isMarketAvailable
  const isError = isEventsError && isMarketAvailable && isHydrated

  const table = useTable({
    data: eventsWithUrls,
    columns: LLAMMA_EVENTS_COLUMNS,
    state: { columnVisibility: eventsColumnVisibility, pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
    ...getTableOptions(eventsWithUrls),
  })

  return { table, isLoading, isError, emptyMessage: t`No activity data found.` }
}
