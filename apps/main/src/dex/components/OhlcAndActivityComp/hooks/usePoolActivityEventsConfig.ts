import { useMemo } from 'react'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolLiquidityEvents } from '@/dex/entities/pool-liquidity.query'
import { usePoolsPricesApi } from '@/dex/queries/pools-prices-api.query'
import { ChainId } from '@/dex/types/main.types'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { scanTxPath } from '@ui/utils'
import {
  type PoolLiquidityRow,
  createPoolLiquidityColumns,
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
 * Hook to manage pool activity events data for the ActivityTable component.
 * Handles fetching, transforming, and providing table configurations for pool liquidity events.
 */
export const usePoolActivityEventsConfig = ({ chainId, poolAddress }: UsePoolActivityProps) => {
  const { isHydrated } = useCurve()
  const { data: networkConfig } = useNetworkByChain({ chainId })
  const network = networkConfig?.id.toLowerCase() as Chain
  const { pagination, onPaginationChange, apiPage } = useManualPagination()

  const { data: pricesApiPoolsMapper, isLoading: isPricesApiPoolsLoading } = usePoolsPricesApi({
    blockchainId: network,
  })
  const poolTokens = useMemo(
    () => pricesApiPoolsMapper?.[poolAddress]?.coins ?? [],
    [pricesApiPoolsMapper, poolAddress],
  )
  const { liquidityColumnVisibility } = usePoolActivityVisibility({ poolTokens })

  const {
    data: liquidityData,
    isLoading: isLiquidityLoading,
    isError: isLiquidityError,
  } = usePoolLiquidityEvents({
    chain: network,
    poolAddress,
    page: apiPage,
    perPage: DEFAULT_PAGE_SIZE,
  })

  const pageCount = getPageCount(liquidityData?.count, DEFAULT_PAGE_SIZE)

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

  const table = useTable({
    data: liquidityWithUrls,
    columns: liquidityColumns,
    state: { columnVisibility: liquidityColumnVisibility, pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
    ...getTableOptions(liquidityWithUrls),
  })

  return { table, isLoading, isError, emptyMessage: t`No liquidity data found.` }
}
