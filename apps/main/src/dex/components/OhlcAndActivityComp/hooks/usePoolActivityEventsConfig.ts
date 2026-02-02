import { useCallback, useMemo, useState } from 'react'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolLiquidityEvents } from '@/dex/entities/pool-liquidity.query'
import { usePoolsPricesApi } from '@/dex/queries/pools-prices-api.query'
import { ChainId } from '@/dex/types/main.types'
import type { Chain, Address } from '@curvefi/prices-api'
import { scanTxPath } from '@ui/utils'
import {
  type ActivityTableConfig,
  type PoolLiquidityRow,
  createPoolLiquidityColumns,
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
 * Hook to manage pool activity events data for the ActivityTable component.
 * Handles fetching, transforming, and providing table configurations for pool liquidity events.
 */
export const usePoolActivityEventsConfig = ({ chainId, poolAddress }: UsePoolActivityProps) => {
  const { isHydrated } = useCurve()
  const { data: networkConfig } = useNetworkByChain({ chainId })
  const network = networkConfig?.id.toLowerCase() as Chain

  const { data: pricesApiPoolsMapper, isLoading: isPricesApiPoolsLoading } = usePoolsPricesApi({
    blockchainId: network,
  })
  const poolTokens = useMemo(
    () => pricesApiPoolsMapper?.[poolAddress]?.coins ?? [],
    [pricesApiPoolsMapper, poolAddress],
  )
  const { liquidityColumnVisibility } = usePoolActivityVisibility({ poolTokens })
  const [pageIndex, setPageIndex] = useState(0)
  const handlePageChange = useCallback((pageIndex: number) => {
    setPageIndex(pageIndex)
  }, [])

  const {
    data: liquidityData,
    isLoading: isLiquidityLoading,
    isError: isLiquidityError,
  } = usePoolLiquidityEvents({
    chain: network,
    poolAddress,
    page: pageIndex + 1, // API uses 1-based & DataTable uses 0-based pages
    perPage: PAGE_SIZE,
  })

  // Transform liquidity data with block explorer URLs and pool tokens
  const liquidityWithUrls: PoolLiquidityRow[] = useMemo(
    () =>
      (network &&
        liquidityData?.events.map((event) => ({
          ...event,
          txUrl: scanTxPath(networkConfig, event.txHash),
          network,
          poolTokens,
        }))) ??
      [],
    [liquidityData?.events, network, networkConfig, poolTokens],
  )

  const liquidityColumns = useMemo(() => createPoolLiquidityColumns({ poolTokens }), [poolTokens])

  const isLoading = isLiquidityLoading || isPricesApiPoolsLoading || !isHydrated
  const isError = isLiquidityError && !isHydrated

  return useMemo(
    () => ({
      data: liquidityWithUrls,
      columns: liquidityColumns as ActivityTableConfig<PoolLiquidityRow>['columns'],
      isLoading,
      isError,
      emptyMessage: t`No liquidity data found.`,
      columnVisibility: liquidityColumnVisibility,
      pageCount: liquidityData?.count ? Math.ceil(liquidityData?.count / PAGE_SIZE) : 0,
      pageIndex: pageIndex,
      pageSize: PAGE_SIZE,
      onPageChange: handlePageChange,
    }),
    [
      liquidityWithUrls,
      liquidityColumns,
      isLoading,
      isError,
      liquidityColumnVisibility,
      liquidityData?.count,
      pageIndex,
      handlePageChange,
    ],
  )
}
