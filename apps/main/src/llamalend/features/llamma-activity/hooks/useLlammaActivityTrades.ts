import { useCallback, useMemo, useState } from 'react'
import { useLlammaTrades } from '@/llamalend/queries/llamma-trades.query'
import type { LlammaTrade } from '@curvefi/prices-api/llamma'
import { scanTxPath } from '@ui/utils'
import {
  type ActivityTableConfig,
  type LlammaTradeRow,
  LLAMMA_TRADES_COLUMNS,
  useLlammaActivityVisibility,
  DEFAULT_PAGE_SIZE,
} from '@ui-kit/features/activity-table'
import { t } from '@ui-kit/lib/i18n'
import { LlammaActivityTradesProps } from '../LlammaActivityTrades'

export const useLlammaActivityTrades = ({
  network,
  ammAddress,
  endpoint,
  networkConfig,
}: LlammaActivityTradesProps) => {
  const { tradesColumnVisibility } = useLlammaActivityVisibility()
  const [pageIndex, setPageIndex] = useState(0)
  const handlePageChange = useCallback((pageIndex: number) => {
    setPageIndex(pageIndex)
  }, [])

  const {
    data: tradesData,
    isLoading: isTradesLoading,
    isError: isTradesError,
  } = useLlammaTrades({
    chain: network,
    llamma: ammAddress,
    endpoint,
    page: pageIndex + 1, // API uses 1-based pages
    perPage: DEFAULT_PAGE_SIZE,
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

  const tradesTableConfig: ActivityTableConfig<LlammaTradeRow> = useMemo(
    () => ({
      data: tradesWithUrls,
      columns: LLAMMA_TRADES_COLUMNS as ActivityTableConfig<LlammaTradeRow>['columns'],
      isLoading: isTradesLoading,
      isError: isTradesError,
      emptyMessage: t`No swap data found.`,
      columnVisibility: tradesColumnVisibility,
      pageIndex,
      pageSize: DEFAULT_PAGE_SIZE,
      pageCount: tradesData?.count ? Math.ceil(tradesData?.count / DEFAULT_PAGE_SIZE) : 0,
      onPageChange: handlePageChange,
    }),
    [
      tradesWithUrls,
      isTradesLoading,
      isTradesError,
      tradesColumnVisibility,
      pageIndex,
      tradesData?.count,
      handlePageChange,
    ],
  )

  return {
    tradesTableConfig,
    isTradesLoading,
    isTradesError,
  }
}
