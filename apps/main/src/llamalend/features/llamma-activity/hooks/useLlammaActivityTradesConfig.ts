import { useMemo } from 'react'
import { useLlammaTrades } from '@/llamalend/queries/llamma-trades.query'
import type { LlammaTrade } from '@curvefi/prices-api/llamma'
import { scanTxPath } from '@ui/utils'
import {
  type LlammaTradeRow,
  LLAMMA_TRADES_COLUMNS,
  useLlammaActivityVisibility,
  useManualPagination,
  getPageCount,
  DEFAULT_PAGE_SIZE,
} from '@ui-kit/features/activity-table'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { LlammaActivityTradesProps } from '../LlammaActivityTrades'

export const useLlammaActivityTradesConfig = ({
  isMarketAvailable,
  network,
  ammAddress,
  endpoint,
  networkConfig,
}: LlammaActivityTradesProps) => {
  const { isHydrated } = useCurve()
  const { tradesColumnVisibility } = useLlammaActivityVisibility()
  const { pagination, onPaginationChange, apiPage } = useManualPagination()

  const {
    data: tradesData,
    isLoading: isTradesLoading,
    isError: isTradesError,
  } = useLlammaTrades({
    chain: network,
    llamma: ammAddress,
    endpoint,
    page: apiPage,
    perPage: DEFAULT_PAGE_SIZE,
  })

  const pageCount = getPageCount(tradesData?.count, DEFAULT_PAGE_SIZE)

  // Transform trades data with block explorer URLs
  const tradesWithUrls: LlammaTradeRow[] = useMemo(
    () =>
      (network &&
        tradesData?.trades.map((trade: LlammaTrade) => ({
          ...trade,
          txUrl: scanTxPath(networkConfig, trade.txHash),
          network,
        }))) ??
      [],
    [tradesData?.trades, networkConfig, network],
  )

  const isLoading = isTradesLoading || !isHydrated || !isMarketAvailable
  const isError = isTradesError && isMarketAvailable && isHydrated

  const table = useTable({
    data: tradesWithUrls,
    columns: LLAMMA_TRADES_COLUMNS,
    state: { columnVisibility: tradesColumnVisibility, pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
    ...getTableOptions(tradesWithUrls),
  })

  return { table, isLoading, isError, emptyMessage: t`No swap data found.` }
}
