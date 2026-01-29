import { useCallback, useMemo, useState } from 'react'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolLiquidityEvents } from '@/dex/entities/pool-liquidity.query'
import { usePoolTrades } from '@/dex/entities/pool-trades.query'
import { ChainId } from '@/dex/types/main.types'
import type { Chain, Address } from '@curvefi/prices-api'
import type { PoolCoin } from '@curvefi/prices-api/pools'
import { scanTxPath } from '@ui/utils'
import {
  type ActivitySelection,
  type ActivityTableConfig,
  type PoolTradeRow,
  type PoolLiquidityRow,
  type PoolActivitySelection,
  createPoolTradesColumns,
  createPoolLiquidityColumns,
  usePoolActivityVisibility,
} from '@ui-kit/features/activity-table'
import { t } from '@ui-kit/lib/i18n'

export const POOL_ACTIVITY_SELECTIONS: ActivitySelection<PoolActivitySelection>[] = [
  { key: 'trades', label: t`Swaps` },
  { key: 'liquidity', label: t`Liquidity` },
]

const PAGE_SIZE = 50
const tradesColumns = createPoolTradesColumns()

type UsePoolActivityProps = {
  chainId: ChainId
  poolAddress: Address | undefined
  poolTokens: PoolCoin[]
}

/**
 * Hook to manage pool activity data (trades and liquidity events) for the ActivityTable component.
 * Handles fetching, transforming, and providing table configurations for both pool trades
 * and liquidity events.
 */
export const usePoolActivity = ({ chainId, poolAddress, poolTokens }: UsePoolActivityProps) => {
  const { data: networkConfig } = useNetworkByChain({ chainId })
  const network = networkConfig?.id.toLowerCase() as Chain

  const [activeSelection, setActiveSelection] = useState<PoolActivitySelection>('trades')
  const [tradesPageIndex, setTradesPageIndex] = useState(0)
  const [liquidityPageIndex, setLiquidityPageIndex] = useState(0)
  const { tradesColumnVisibility, liquidityColumnVisibility } = usePoolActivityVisibility({ poolTokens })

  const {
    data: tradesData,
    isLoading: isTradesLoading,
    isError: isTradesError,
  } = usePoolTrades({
    chain: network,
    poolAddress,
    page: tradesPageIndex + 1, // API uses 1-based pages
    perPage: PAGE_SIZE,
  })

  const {
    data: liquidityData,
    isLoading: isLiquidityLoading,
    isError: isLiquidityError,
  } = usePoolLiquidityEvents({
    chain: network,
    poolAddress,
    page: liquidityPageIndex + 1, // API uses 1-based pages
    perPage: PAGE_SIZE,
  })

  // Transform trades data with block explorer URLs
  const tradesWithUrls: PoolTradeRow[] | undefined = useMemo(
    () =>
      network &&
      tradesData?.trades.map((trade) => ({
        ...trade,
        txUrl: scanTxPath(networkConfig, trade.txHash),
        network,
      })),
    [tradesData?.trades, networkConfig, network],
  )

  // Transform liquidity data with block explorer URLs and pool tokens
  const liquidityWithUrls: PoolLiquidityRow[] | undefined = useMemo(
    () =>
      network &&
      liquidityData?.events.map((event) => ({
        ...event,
        txUrl: scanTxPath(networkConfig, event.txHash),
        network,
        poolTokens,
      })),
    [liquidityData?.events, network, networkConfig, poolTokens],
  )

  const liquidityColumns = useMemo(() => createPoolLiquidityColumns({ poolTokens }), [poolTokens])

  // Page change handlers
  const handleTradesPageChange = useCallback((pageIndex: number) => {
    setTradesPageIndex(pageIndex)
  }, [])

  const handleLiquidityPageChange = useCallback((pageIndex: number) => {
    setLiquidityPageIndex(pageIndex)
  }, [])

  const tradesTableConfig: ActivityTableConfig<PoolTradeRow> = useMemo(
    () => ({
      data: tradesWithUrls,
      columns: tradesColumns,
      isLoading: isTradesLoading,
      isError: isTradesError,
      emptyMessage: t`No swap data found.`,
      columnVisibility: tradesColumnVisibility,
      pageCount: tradesData?.count,
      pageIndex: tradesPageIndex,
      pageSize: PAGE_SIZE,
      onPageChange: handleTradesPageChange,
    }),
    [
      tradesWithUrls,
      isTradesLoading,
      isTradesError,
      tradesColumnVisibility,
      tradesData?.count,
      tradesPageIndex,
      handleTradesPageChange,
    ],
  )

  const liquidityTableConfig: ActivityTableConfig<PoolLiquidityRow> = useMemo(
    () => ({
      data: liquidityWithUrls,
      columns: liquidityColumns,
      isLoading: isLiquidityLoading,
      isError: isLiquidityError,
      emptyMessage: t`No liquidity data found.`,
      columnVisibility: liquidityColumnVisibility,
      pageCount: liquidityData?.count,
      pageIndex: liquidityPageIndex,
      pageSize: PAGE_SIZE,
      onPageChange: handleLiquidityPageChange,
    }),
    [
      liquidityWithUrls,
      liquidityColumns,
      isLiquidityLoading,
      isLiquidityError,
      liquidityColumnVisibility,
      liquidityData?.count,
      liquidityPageIndex,
      handleLiquidityPageChange,
    ],
  )

  return {
    activeSelection,
    setActiveSelection,
    selections: POOL_ACTIVITY_SELECTIONS,
    tradesTableConfig,
    liquidityTableConfig,
    isTradesLoading,
    isLiquidityLoading,
    isTradesError,
    isLiquidityError,
  }
}
