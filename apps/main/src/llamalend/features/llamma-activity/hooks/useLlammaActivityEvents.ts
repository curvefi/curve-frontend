import { useCallback, useMemo, useState } from 'react'
import { useLlammaEvents } from '@/llamalend/queries/llamma-events.query'
import type { LlammaEvent } from '@curvefi/prices-api/llamma'
import { scanTxPath } from '@ui/utils'
import {
  type ActivityTableConfig,
  type LlammaEventRow,
  LLAMMA_EVENTS_COLUMNS,
  useLlammaActivityVisibility,
  DEFAULT_PAGE_SIZE,
} from '@ui-kit/features/activity-table'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { LlammaActivityProps } from '../'

export const useLlammaActivityEvents = ({
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
  const [pageIndex, setPageIndex] = useState(0)
  const handlePageChange = useCallback((pageIndex: number) => {
    setPageIndex(pageIndex)
  }, [])

  const {
    data: eventsData,
    isLoading: isEventsLoading,
    isError: isEventsError,
  } = useLlammaEvents({
    chain: network,
    llamma: ammAddress,
    endpoint,
    page: pageIndex + 1, // API uses 1-based pages
    perPage: DEFAULT_PAGE_SIZE,
  })

  // Transform events data with block explorer URLs
  const eventsWithUrls: LlammaEventRow[] | undefined = useMemo(
    () =>
      network &&
      eventsData?.events.map((event: LlammaEvent) => ({
        ...event,
        txUrl: scanTxPath(networkConfig, event.txHash),
        network,
        collateralToken,
        borrowToken,
      })),
    [eventsData?.events, network, networkConfig, collateralToken, borrowToken],
  )

  const isLoading = isEventsLoading || !isHydrated || !isMarketAvailable
  const isError = isEventsError && isMarketAvailable && isHydrated

  const eventsTableConfig: ActivityTableConfig<LlammaEventRow> = useMemo(
    () => ({
      data: eventsWithUrls,
      columns: LLAMMA_EVENTS_COLUMNS as ActivityTableConfig<LlammaEventRow>['columns'],
      isLoading,
      isError,
      emptyMessage: t`No activity data found.`,
      columnVisibility: eventsColumnVisibility,
      pageIndex: pageIndex,
      pageSize: DEFAULT_PAGE_SIZE,
      pageCount: eventsData?.count ? Math.ceil(eventsData?.count / DEFAULT_PAGE_SIZE) : 0,
      onPageChange: handlePageChange,
    }),
    [eventsWithUrls, isLoading, isError, eventsColumnVisibility, pageIndex, eventsData?.count, handlePageChange],
  )

  return {
    eventsTableConfig,
    isEventsLoading: isLoading,
    isEventsError: isError,
  }
}
