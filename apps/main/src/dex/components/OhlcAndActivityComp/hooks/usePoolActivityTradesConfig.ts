import { useMemo } from 'react'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolTrades } from '@/dex/entities/pool-trades.query'
import { usePoolsPricesApi } from '@/dex/queries/pools-prices-api.query'
import { ChainId } from '@/dex/types/main.types'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { scanTxPath } from '@ui/utils'
import {
  type PoolTradeRow,
  POOL_TRADES_COLUMNS,
  usePoolActivityVisibility,
  useManualPagination,
  getPageCount,
  DEFAULT_PAGE_SIZE,
} from '@ui-kit/features/activity-table'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'

type UsePoolActivityProps = {
  chainId: ChainId
  poolAddress: Address
}

/**
 * Hook to manage pool activity data for the ActivityTable component.
 * Handles fetching, transforming, and providing table configurations for pool trade events.
 */
export const usePoolActivityTradesConfig = ({ chainId, poolAddress }: UsePoolActivityProps) => {
  const { data: networkConfig } = useNetworkByChain({ chainId })
  const network = networkConfig?.id.toLowerCase() as Chain
  const { isHydrated } = useCurve()
  const { pagination, onPaginationChange, apiPage } = useManualPagination()

  const { data: pricesApiPoolsMapper, isLoading: isPricesApiPoolsLoading } = usePoolsPricesApi({
    blockchainId: network,
  })
  const poolTokens = useMemo(
    () => pricesApiPoolsMapper?.[poolAddress]?.coins ?? [],
    [pricesApiPoolsMapper, poolAddress],
  )
  const { tradesColumnVisibility } = usePoolActivityVisibility({ poolTokens })

  const {
    data: tradesData,
    isLoading: isTradesLoading,
    isError: isTradesError,
  } = usePoolTrades({
    chain: network,
    poolAddress,
    page: apiPage,
    perPage: DEFAULT_PAGE_SIZE,
  })

  const pageCount = getPageCount(tradesData?.count, DEFAULT_PAGE_SIZE)

  // Transform trades data with block explorer URLs
  const tradesWithUrls: PoolTradeRow[] = useMemo(
    () =>
      (network &&
        tradesData?.trades.map((trade) => ({
          ...trade,
          txUrl: scanTxPath(networkConfig, trade.txHash),
          network,
        }))) ??
      [],
    [tradesData?.trades, networkConfig, network],
  )

  const isLoading = isTradesLoading || isPricesApiPoolsLoading || !isHydrated
  const isError = isTradesError && !isHydrated

  const table = useTable({
    data: tradesWithUrls,
    columns: POOL_TRADES_COLUMNS,
    state: { columnVisibility: tradesColumnVisibility, pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
    ...getTableOptions(tradesWithUrls),
  })

  return { table, isLoading, isError, emptyMessage: t`No swap data found.` }
}
