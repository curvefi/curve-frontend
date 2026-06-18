import { useMemo } from 'react'
import { useLlammaEvents } from '@/llamalend/queries/llamma-events.query'
import type { LlammaEvent } from '@curvefi/prices-api/llamma'
import { scanAddressPath, scanTxPath } from '@ui/utils'
import {
  type LlammaEventRow,
  LLAMMA_EVENTS_COLUMNS,
  useLlammaActivityVisibility,
  useManualPagination,
  getPageCount,
  DEFAULT_PAGE_SIZE,
} from '@ui-kit/features/activity-table'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { q } from '@ui-kit/types/util'
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

  const {
    data: eventsData,
    error: eventsError,
    isLoading: isEventsLoading,
  } = useLlammaEvents({
    chain: network,
    llamma: ammAddress,
    endpoint,
    page: apiPage,
    perPage: DEFAULT_PAGE_SIZE,
  })

  const pageCount = getPageCount(eventsData?.count, DEFAULT_PAGE_SIZE)

  // Transform events data with block explorer URLs
  const eventsWithUrls: LlammaEventRow[] | undefined = useMemo(
    () =>
      (network &&
        eventsData?.events.map((event: LlammaEvent) => ({
          ...event,
          providerUrl: scanAddressPath(networkConfig, event.provider),
          txUrl: scanTxPath(networkConfig, event.txHash),
          network,
          collateralToken,
          borrowToken,
        }))) ??
      [],
    [eventsData?.events, network, networkConfig, collateralToken, borrowToken],
  )

  const table = useTable({
    query: q({
      data: eventsWithUrls,
      isLoading: isEventsLoading || !isMarketAvailable,
      error: isMarketAvailable ? eventsError : null,
    }),
    columns: LLAMMA_EVENTS_COLUMNS,
    state: { columnVisibility: eventsColumnVisibility, pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
    ...getTableOptions(eventsWithUrls),
  })

  return {
    table,
    emptyMessage: t`No activity data found.`,
    errorMessage: t`Could not load activity data.`,
  }
}
