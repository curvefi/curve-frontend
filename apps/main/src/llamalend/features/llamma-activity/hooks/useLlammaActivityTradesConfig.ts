import { useMemo } from 'react'
import { getAmmAddress } from '@/llamalend/llama.utils'
import { useLlammaTrades } from '@/llamalend/queries/llamma-trades.query'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { isPricesApiChain } from '@curvefi/prices-api'
import type { LlammaTrade } from '@curvefi/prices-api/llamma'
import { scanAddressPath, scanTxPath } from '@ui/utils'
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
  marketQuery: { data: market },
  networkConfig,
}: LlammaActivityTradesProps) => {
  const { isHydrated } = useCurve()
  const { tradesColumnVisibility } = useLlammaActivityVisibility()
  const { pagination, onPaginationChange, apiPage } = useManualPagination()
  const networkId = networkConfig?.id.toLowerCase()
  const network = networkId && isPricesApiChain(networkId) ? networkId : undefined
  const ammAddress = getAmmAddress(market)
  const endpoint = market instanceof MintMarketTemplate ? 'crvusd' : 'lending'
  const isMarketAvailable = !!market

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
          buyerUrl: scanAddressPath(networkConfig, trade.buyer),
          txUrl: scanTxPath(networkConfig, trade.txHash),
          network,
        }))) ??
      [],
    [tradesData?.trades, networkConfig, network],
  )

  const table = useTable({
    data: tradesWithUrls,
    columns: LLAMMA_TRADES_COLUMNS,
    state: { columnVisibility: tradesColumnVisibility, pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
    ...getTableOptions(tradesWithUrls),
  })

  return {
    table,
    isLoading: isTradesLoading || !isHydrated || !isMarketAvailable,
    isError: isTradesError && isHydrated && isMarketAvailable,
    emptyMessage: t`No swap data found.`,
    errorMessage: t`Could not load swap data.`,
  }
}
