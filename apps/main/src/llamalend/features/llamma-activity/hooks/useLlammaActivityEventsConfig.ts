import { useMemo } from 'react'
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
import { getPageCount } from '@ui-kit/utils'
import { LlammaActivityProps } from '..'

export const useLlammaActivityEventsConfig = ({
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
    data: eventsWithUrls,
    columns: LLAMMA_EVENTS_COLUMNS,
    state: { columnVisibility: eventsColumnVisibility, pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
    ...getTableOptions(eventsWithUrls),
  })

  return {
    table,
    isLoading: isEventsLoading || !ammAddress,
    isError: isEventsError,
    emptyMessage: t`No activity data found.`,
    errorMessage: t`Could not load activity data.`,
  }
}
