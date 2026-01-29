import { useCallback, useMemo, useState } from 'react'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolLiquidityEvents } from '@/dex/entities/pool-liquidity.query'
import { ChainId } from '@/dex/types/main.types'
import type { Chain, Address } from '@curvefi/prices-api'
import type { PoolCoin } from '@curvefi/prices-api/pools'
import { scanTxPath } from '@ui/utils'
import {
  type ActivityTableConfig,
  type PoolLiquidityRow,
  createPoolLiquidityColumns,
  usePoolActivityVisibility,
} from '@ui-kit/features/activity-table'
import { t } from '@ui-kit/lib/i18n'

const PAGE_SIZE = 50

type UsePoolActivityProps = {
  chainId: ChainId
  poolAddress: Address | undefined
  poolTokens: PoolCoin[]
}

/**
 * Hook to manage pool activity events data for the ActivityTable component.
 * Handles fetching, transforming, and providing table configurations for pool liquidity events.
 */
export const usePoolActivityEvents = ({ chainId, poolAddress, poolTokens }: UsePoolActivityProps) => {
  const { data: networkConfig } = useNetworkByChain({ chainId })
  const network = networkConfig?.id.toLowerCase() as Chain

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
    page: pageIndex + 1, // API uses 1-based pages
    perPage: PAGE_SIZE,
  })

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

  const liquidityTableConfig: ActivityTableConfig<PoolLiquidityRow> = useMemo(
    () => ({
      data: liquidityWithUrls,
      columns: liquidityColumns as ActivityTableConfig<PoolLiquidityRow>['columns'],
      isLoading: isLiquidityLoading,
      isError: isLiquidityError,
      emptyMessage: t`No liquidity data found.`,
      columnVisibility: liquidityColumnVisibility,
      pageCount: liquidityData?.count,
      pageIndex: pageIndex,
      pageSize: PAGE_SIZE,
      onPageChange: handlePageChange,
    }),
    [
      liquidityWithUrls,
      liquidityColumns,
      isLiquidityLoading,
      isLiquidityError,
      liquidityColumnVisibility,
      liquidityData?.count,
      pageIndex,
      handlePageChange,
    ],
  )

  return {
    liquidityTableConfig,
    isLiquidityLoading,
    isLiquidityError,
  }
}
