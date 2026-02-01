import { useCallback, useMemo, useState } from 'react'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolTrades } from '@/dex/entities/pool-trades.query'
import { usePoolsPricesApi } from '@/dex/queries/pools-prices-api.query'
import { ChainId } from '@/dex/types/main.types'
import type { Chain, Address } from '@curvefi/prices-api'
import { scanTxPath } from '@ui/utils'
import {
  type ActivityTableConfig,
  type PoolTradeRow,
  POOL_TRADES_COLUMNS,
  usePoolActivityVisibility,
} from '@ui-kit/features/activity-table'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'

const PAGE_SIZE = 50

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

  const { data: pricesApiPoolsMapper, isLoading: isPricesApiPoolsLoading } = usePoolsPricesApi({
    blockchainId: network,
  })
  const poolTokens = useMemo(
    () => pricesApiPoolsMapper?.[poolAddress]?.coins ?? [],
    [pricesApiPoolsMapper, poolAddress],
  )
  const { tradesColumnVisibility } = usePoolActivityVisibility({ poolTokens })
  const [pageIndex, setPageIndex] = useState(0)
  const handlePageChange = useCallback((pageIndex: number) => {
    setPageIndex(pageIndex)
  }, [])

  const {
    data: tradesData,
    isLoading: isTradesLoading,
    isError: isTradesError,
  } = usePoolTrades({
    chain: network,
    poolAddress,
    page: pageIndex + 1, // API uses 1-based & DataTable uses 0-based pages
    perPage: PAGE_SIZE,
  })

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

  const tradesTableConfig = useMemo(
    (): ActivityTableConfig<PoolTradeRow> => ({
      data: tradesWithUrls,
      columns: POOL_TRADES_COLUMNS as ActivityTableConfig<PoolTradeRow>['columns'],
      isLoading,
      isError,
      emptyMessage: t`No swap data found.`,
      columnVisibility: tradesColumnVisibility,
      pageCount: tradesData?.count ? Math.ceil(tradesData?.count / PAGE_SIZE) : 0,
      pageIndex: pageIndex,
      pageSize: PAGE_SIZE,
      onPageChange: handlePageChange,
    }),
    [tradesWithUrls, isLoading, isError, tradesColumnVisibility, tradesData?.count, pageIndex, handlePageChange],
  )

  return tradesTableConfig
}
