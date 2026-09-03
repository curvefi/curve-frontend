import { useLlammaTrades } from '@/llamalend/queries/llamma-trades.query'
import type { LlammaTrade } from '@curvefi/prices-api/llamma'
import {
  LLAMMA_TRADES_COLUMNS,
  useLlammaActivityVisibility,
  useManualPagination,
  DEFAULT_PAGE_SIZE,
} from '@evm-ui/features/activity-table'
import { t } from '@evm-ui/lib/i18n'
import { useCurveTable } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { getPageCount } from '@evm-ui/utils'
import { maybe } from '@primitives/objects.utils'
import { mapQuery, q } from '@ui/features/queries/util'
import { LlammaActivityTradesProps } from '../LlammaActivityTrades'

export const useLlammaActivityTradesConfig = ({
  chainId,
  blockchainId,
  ammAddress,
  endpoint,
}: LlammaActivityTradesProps) => {
  const { tradesColumnVisibility } = useLlammaActivityVisibility()
  const { pagination, onPaginationChange, apiPage } = useManualPagination()

  const tradesQuery = useLlammaTrades({
    chain: blockchainId,
    llamma: ammAddress,
    endpoint,
    page: apiPage,
    perPage: DEFAULT_PAGE_SIZE,
  })

  const pageCount = getPageCount(tradesQuery.data?.count, DEFAULT_PAGE_SIZE)

  // Transform trades data with block explorer URLs
  const tradesWithUrlsQuery = mapQuery(tradesQuery, ({ trades }) =>
    maybe(blockchainId, blockchainId => trades.map((trade: LlammaTrade) => ({ ...trade, chainId, blockchainId }))),
  )

  const table = useCurveTable({
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
  })

  return {
    table,
    emptyState: { title: t`No swap data found.` },
    errorState: { title: t`Could not load swap data.` },
  }
}
