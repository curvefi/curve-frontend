import { useCallback, useMemo, useState } from 'react'
import { useLlammaEvents } from '@/llamalend/queries/llamma-events.query'
import { useLlammaTrades } from '@/llamalend/queries/llamma-trades.query'
import type { Chain, Address } from '@curvefi/prices-api'
import type { LlammaEvent, LlammaTrade } from '@curvefi/prices-api/llamma'
import { scanTxPath, type BaseConfig } from '@ui/utils'
import type { ActivitySelection, ActivityTableConfig } from '@ui-kit/features/activity-table'
import { t } from '@ui-kit/lib/i18n'
import { createTradesColumns, createEventsColumns } from '../columns'
import { useLlammaActivityVisibility } from './useLlammaActivityVisibility'

// Extended types with url property for TableItem compatibility
export type TradeRow = LlammaTrade & { url?: string; network: Chain }
export type EventRow = LlammaEvent & { url?: string; network: Chain; collateralToken: Token | undefined; borrowToken: Token | undefined }

export type LlammaActivitySelection = 'trades' | 'events'

export const LLAMMA_ACTIVITY_SELECTIONS: ActivitySelection<LlammaActivitySelection>[] = [
  { key: 'trades', label: t`AMM` },
  { key: 'events', label: t`Controller` },
]

export type Token = {
  symbol: string
  address: Address
}

const PAGE_SIZE = 50

type UseLlammaActivityProps = {
  /** The chain identifier for the prices API (e.g., 'ethereum', 'arbitrum') */
  network: Chain | undefined
  /** The AMM contract address */
  collateralToken: Token | undefined
  borrowToken: Token | undefined
  ammAddress: Address | undefined
  /** The endpoint type ('lending' or 'crvusd') */
  endpoint: 'lending' | 'crvusd'
  /** Network config for generating block explorer URLs */
  networkConfig: BaseConfig | undefined
}

/**
 * Hook to manage LLAMMA activity data (trades and events) for the ActivityTable component.
 * Handles fetching, transforming, and providing table configurations for both AMM trades
 * and Controller events.
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
    blockchainId: network,
    contractAddress: ammAddress,
    endpoint,
    page: tradesPageIndex + 1, // API uses 1-based pages
    perPage: PAGE_SIZE,
  })

  const {
    data: eventsData,
    isLoading: isEventsLoading,
    isError: isEventsError,
  } = useLlammaEvents({
    blockchainId: network,
    contractAddress: ammAddress,
    endpoint,
    page: eventsPageIndex + 1, // API uses 1-based pages
    perPage: PAGE_SIZE,
  })

  // Transform trades data with block explorer URLs
  const tradesWithUrls: TradeRow[] = useMemo(
    () =>
      network
        ? (tradesData?.trades.map((trade) => ({
            ...trade,
            url: scanTxPath(networkConfig, trade.txHash),
            network,
          })) ?? [])
        : [],
    [tradesData?.trades, networkConfig, network],
  )

  // Transform events data with block explorer URLs
  const eventsWithUrls: EventRow[] = useMemo(
    () =>
      network
        ? (eventsData?.events.map((event) => ({
            ...event,
            url: scanTxPath(networkConfig, event.txHash),
            network,
            collateralToken,
            borrowToken,
          })) ?? [])
        : [],
    [eventsData?.events, network, networkConfig, collateralToken, borrowToken],
  )

  // Memoize column definitions
  const tradesColumns = useMemo(() => createTradesColumns(), [])
  const eventsColumns = useMemo(() => createEventsColumns(), [])

  // Page change handlers
  const handleTradesPageChange = useCallback((pageIndex: number) => {
    setTradesPageIndex(pageIndex)
  }, [])

  const handleEventsPageChange = useCallback((pageIndex: number) => {
    setEventsPageIndex(pageIndex)
  }, [])

  const tradesTableConfig: ActivityTableConfig<TradeRow> = useMemo(
    () => ({
      data: tradesWithUrls,
      columns: tradesColumns,
      isLoading: isTradesLoading,
      isError: isTradesError,
      emptyMessage: t`No trades data found.`,
      columnVisibility: tradesColumnVisibility,
      totalRows: tradesData?.count ?? 0,
      pageIndex: tradesPageIndex,
      pageSize: PAGE_SIZE,
      onPageChange: handleTradesPageChange,
    }),
    [tradesWithUrls, tradesColumns, isTradesLoading, isTradesError, tradesColumnVisibility, tradesData?.count, tradesPageIndex, handleTradesPageChange],
  )

  const eventsTableConfig: ActivityTableConfig<EventRow> = useMemo(
    () => ({
      data: eventsWithUrls,
      columns: eventsColumns,
      isLoading: isEventsLoading,
      isError: isEventsError,
      emptyMessage: t`No controller data found.`,
      columnVisibility: eventsColumnVisibility,
      totalRows: eventsData?.count ?? 0,
      pageIndex: eventsPageIndex,
      pageSize: PAGE_SIZE,
      onPageChange: handleEventsPageChange,
    }),
    [eventsWithUrls, eventsColumns, isEventsLoading, isEventsError, eventsColumnVisibility, eventsData?.count, eventsPageIndex, handleEventsPageChange],
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
