import { useCallback, useMemo, useState } from 'react'
import { useLlammaEvents } from '@/llamalend/queries/llamma-events.query'
import { useLlammaTrades } from '@/llamalend/queries/llamma-trades.query'
import type { Chain, Address } from '@curvefi/prices-api'
import type { LlammaTrade, LlammaEvent } from '@curvefi/prices-api/llamma'
import { scanTxPath, type BaseConfig } from '@ui/utils'
import {
  type ActivitySelection,
  type ActivityTableConfig,
  type LlammaTradeRow,
  type LlammaEventRow,
  type Token,
  type LlammaActivitySelection,
  createLlammaTradesColumns,
  createLlammaEventsColumns,
  useLlammaActivityVisibility,
} from '@ui-kit/features/activity-table'
import { t } from '@ui-kit/lib/i18n'

export const LLAMMA_ACTIVITY_SELECTIONS: ActivitySelection<LlammaActivitySelection>[] = [
  { key: 'trades', label: t`AMM` },
  { key: 'events', label: t`Controller` },
]

const PAGE_SIZE = 50

export type UseLlammaActivityProps = {
  /** The chain identifier for the prices API (e.g., 'ethereum', 'arbitrum') */
  network: Chain | undefined
  /** The collateral token info */
  collateralToken: Token | undefined
  /** The borrow token info */
  borrowToken: Token | undefined
  /** The AMM contract address */
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
  const tradesWithUrls: LlammaTradeRow[] = useMemo(
    () =>
      network
        ? (tradesData?.trades.map((trade: LlammaTrade) => ({
            ...trade,
            url: scanTxPath(networkConfig, trade.txHash),
            network,
          })) ?? [])
        : [],
    [tradesData?.trades, networkConfig, network],
  )

  // Transform events data with block explorer URLs
  const eventsWithUrls: LlammaEventRow[] = useMemo(
    () =>
      network
        ? (eventsData?.events.map((event: LlammaEvent) => ({
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
  const tradesColumns = useMemo(() => createLlammaTradesColumns(), [])
  const eventsColumns = useMemo(() => createLlammaEventsColumns(), [])

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
      columns: tradesColumns,
      isLoading: isTradesLoading,
      isError: isTradesError,
      emptyMessage: t`No swap data found.`,
      columnVisibility: tradesColumnVisibility,
      totalRows: tradesData?.count ?? 0,
      pageIndex: tradesPageIndex,
      pageSize: PAGE_SIZE,
      onPageChange: handleTradesPageChange,
    }),
    [
      tradesWithUrls,
      tradesColumns,
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
    [
      eventsWithUrls,
      eventsColumns,
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
