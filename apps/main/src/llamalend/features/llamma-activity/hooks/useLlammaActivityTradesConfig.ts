import { useLlammaTrades } from '@/llamalend/queries/llamma-trades.query'
import type { LlammaTrade } from '@curvefi/prices-api/llamma'
import { scanAddressPath, scanTxPath } from '@ui/utils'
import {
  type LlammaTradeRow,
  LLAMMA_TRADES_COLUMNS,
  useLlammaActivityVisibility,
  useManualPagination,
  DEFAULT_PAGE_SIZE,
} from '@ui-kit/features/activity-table'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { mapQuery, q } from '@ui-kit/types/util'
import { getPageCount } from '@ui-kit/utils'
import { LlammaActivityTradesProps } from '../LlammaActivityTrades'

export const useLlammaActivityTradesConfig = ({
  network,
  ammAddress,
  endpoint,
  networkConfig,
}: LlammaActivityTradesProps) => {
  const { tradesColumnVisibility } = useLlammaActivityVisibility()
  const { pagination, onPaginationChange, apiPage } = useManualPagination()

  const tradesQuery = useLlammaTrades({
    chain: network,
    llamma: ammAddress,
    endpoint,
    page: apiPage,
    perPage: DEFAULT_PAGE_SIZE,
  })

  const pageCount = getPageCount(tradesQuery.data?.count, DEFAULT_PAGE_SIZE)

  // Transform trades data with block explorer URLs
  const tradesWithUrlsQuery = mapQuery(
    tradesQuery,
    ({ trades }) =>
      network &&
      trades.map((trade: LlammaTrade) => ({
        ...trade,
        buyerUrl: scanAddressPath(networkConfig, trade.buyer),
        txUrl: scanTxPath(networkConfig, trade.txHash),
        network,
      })),
  )

  const table = useTable({
    query: q({
      data: tradesWithUrlsQuery.data,
      isLoading: tradesWithUrlsQuery.isLoading || !ammAddress,
      error: ammAddress ? tradesWithUrlsQuery.error : null,
    }),
    columns: LLAMMA_TRADES_COLUMNS,
    state: { columnVisibility: tradesColumnVisibility, pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
    ...getTableOptions<LlammaTradeRow>(tradesWithUrlsQuery.data),
  })

  return {
    table,
    emptyState: { title: t`No swap data found.` },
    errorState: { title: t`Could not load swap data.` },
  }
}
