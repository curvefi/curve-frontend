import { useCallback, useMemo, useState } from 'react'
import { useLlammaEvents } from '@/llamalend/queries/llamma-events.query'
import { useLlammaTrades } from '@/llamalend/queries/llamma-trades.query'
import type { Chain, Address } from '@curvefi/prices-api'
import type { LlammaTrade, LlammaEvent, Endpoint } from '@curvefi/prices-api/llamma'
import { scanTxPath, type BaseConfig } from '@ui/utils'
import {
  type ActivitySelection,
  type ActivityTableConfig,
  type LlammaTradeRow,
  type LlammaEventRow,
  type Token,
  type LlammaActivitySelection,
  LLAMMA_TRADES_COLUMNS,
  LLAMMA_EVENTS_COLUMNS,
  useLlammaActivityVisibility,
} from '@ui-kit/features/activity-table'
import { t } from '@ui-kit/lib/i18n'

export const LLAMMA_ACTIVITY_SELECTIONS: ActivitySelection<LlammaActivitySelection>[] = [
  { key: 'trades', label: t`Swaps` },
  { key: 'events', label: t`Activity` },
]

const PAGE_SIZE = 50

export type UseLlammaActivityProps = {
  network: Chain | undefined
  collateralToken: Token | undefined
  borrowToken: Token | undefined
  ammAddress: Address | undefined
  endpoint: Endpoint
  networkConfig: BaseConfig | undefined
}

/**
 * Hook to manage LLAMMA activity data (trades and events) for the ActivityTable component.
 * Handles fetching, transforming, and providing table configurations for both AMM swaps
 * and Controller activity.
 */
export const useLlammaActivity = ({
  network,
  collateralToken,
  borrowToken,
  ammAddress,
  endpoint,
  networkConfig,
}: UseLlammaActivityProps) => {
  const [activeSelection, setActiveSelection] = useState<LlammaActivitySelection>('trades')
  const [tradesPageIndex, setTradesPageIndex] = useState(0)
  const [eventsPageIndex, setEventsPageIndex] = useState(0)
  const { tradesColumnVisibility, eventsColumnVisibility } = useLlammaActivityVisibility()

  const {
    data: tradesData,
    isLoading: isTradesLoading,
    isError: isTradesError,
  } = useLlammaTrades({
    chain: network,
    llamma: ammAddress,
    endpoint,
    page: tradesPageIndex + 1, // API uses 1-based pages
    perPage: PAGE_SIZE,
  })

  const {
    data: eventsData,
    isLoading: isEventsLoading,
    isError: isEventsError,
  } = useLlammaEvents({
    chain: network,
    llamma: ammAddress,
    endpoint,
    page: eventsPageIndex + 1, // API uses 1-based pages
    perPage: PAGE_SIZE,
  })

  // Transform trades data with block explorer URLs
  const tradesWithUrls: LlammaTradeRow[] | undefined = useMemo(
    () =>
      network &&
      tradesData?.trades.map((trade: LlammaTrade) => ({
        ...trade,
        txUrl: scanTxPath(networkConfig, trade.txHash),
        network,
      })),
    [tradesData?.trades, networkConfig, network],
  )

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

  // Page change handlers
  const handleTradesPageChange = useCallback((pageIndex: number) => {
    setTradesPageIndex(pageIndex)
  }, [])

  const handleEventsPageChange = useCallback((pageIndex: number) => {
    setEventsPageIndex(pageIndex)
  }, [])

  const tradesTableConfig: ActivityTableConfig<LlammaTradeRow> = useMemo(
    () => ({
      data: tradesWithUrls,
      columns: LLAMMA_TRADES_COLUMNS as ActivityTableConfig<LlammaTradeRow>['columns'],
      isLoading: isTradesLoading,
      isError: isTradesError,
      emptyMessage: t`No swap data found.`,
      columnVisibility: tradesColumnVisibility,
      pageIndex: tradesPageIndex,
      pageSize: PAGE_SIZE,
      pageCount: tradesData?.count,
      onPageChange: handleTradesPageChange,
    }),
    [
      tradesWithUrls,
      isTradesLoading,
      isTradesError,
      tradesColumnVisibility,
      tradesData?.count,
      tradesPageIndex,
      handleTradesPageChange,
    ],
  )

  const eventsTableConfig: ActivityTableConfig<LlammaEventRow> = useMemo(
    () => ({
      data: eventsWithUrls,
      columns: LLAMMA_EVENTS_COLUMNS as ActivityTableConfig<LlammaEventRow>['columns'],
      isLoading: isEventsLoading,
      isError: isEventsError,
      emptyMessage: t`No activity data found.`,
      columnVisibility: eventsColumnVisibility,
      pageIndex: eventsPageIndex,
      pageSize: PAGE_SIZE,
      pageCount: eventsData?.count,
      onPageChange: handleEventsPageChange,
    }),
    [
      eventsWithUrls,
      isEventsLoading,
      isEventsError,
      eventsColumnVisibility,
      eventsData?.count,
      eventsPageIndex,
      handleEventsPageChange,
    ],
  )

  return {
    activeSelection,
    setActiveSelection,
    selections: LLAMMA_ACTIVITY_SELECTIONS,
    tradesTableConfig,
    eventsTableConfig,
    isTradesLoading,
    isEventsLoading,
    isTradesError,
    isEventsError,
  }
}
