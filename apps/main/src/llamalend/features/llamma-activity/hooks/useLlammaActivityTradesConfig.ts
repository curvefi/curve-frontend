import { isAddressEqual } from 'viem'
import { withLpCoins } from '@/llamalend/llama.utils'
import { useLlammaTrades } from '@/llamalend/queries/llamma-trades.query'
import type { LlammaTrade } from '@curvefi/prices-api/llamma'
import { LLAMMA_TRADES_COLUMNS } from '@evm-ui/features/activity-table/columns/llamma-trades-columns'
import { useLlammaActivityVisibility } from '@evm-ui/features/activity-table/hooks/useLlammaActivityVisibility'
import { useManualPagination } from '@evm-ui/features/activity-table/hooks/useManualPagination'
import { DEFAULT_PAGE_SIZE } from '@evm-ui/features/activity-table/utils'
import { getPageCount } from '@evm-ui/utils'
import type { Token } from '@primitives/address.utils'
import { maybe } from '@primitives/objects.utils'
import { mapQuery, q } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'
import type { LlammaActivityProps } from '../types'

export const useLlammaActivityTradesConfig = ({
  chainId,
  blockchainId,
  collateralToken,
  borrowToken,
  ammAddress,
  endpoint,
}: LlammaActivityProps) => {
  const { tradesColumnVisibility } = useLlammaActivityVisibility()
  const { pagination, onPaginationChange, apiPage } = useManualPagination()

  const tradesQuery = useLlammaTrades({
    blockchainId,
    llamma: ammAddress,
    endpoint,
    page: apiPage,
    perPage: DEFAULT_PAGE_SIZE,
  })

  /** The market tokens carry the coins of LP tokens, which the prices API doesn't return */
  const withMarketLpCoins = (token: Token) =>
    withLpCoins(
      token,
      [collateralToken, borrowToken].find(
        marketToken => marketToken && isAddressEqual(marketToken.address, token.address),
      )?.lpCoins,
    )

  const pageCount = getPageCount(tradesQuery.data?.count, DEFAULT_PAGE_SIZE)

  // Transform trades data with block explorer URLs
  const tradesWithUrlsQuery = mapQuery(tradesQuery, ({ trades }) =>
    maybe(blockchainId, blockchainId =>
      trades.map((trade: LlammaTrade) => ({
        ...trade,
        chainId,
        blockchainId,
        tokenBought: withMarketLpCoins(trade.tokenBought),
        tokenSold: withMarketLpCoins(trade.tokenSold),
      })),
    ),
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

  return { table, emptyState: { title: t`No swap data found.` }, errorState: { title: t`Could not load swap data.` } }
}
