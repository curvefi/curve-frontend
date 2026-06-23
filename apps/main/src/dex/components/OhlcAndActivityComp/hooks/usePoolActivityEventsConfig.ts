import { useCallback, useMemo } from 'react'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolLiquidityEvents } from '@/dex/entities/pool-liquidity.query'
import { usePoolsPricesApi } from '@/dex/queries/pools-prices-api.query'
import { ChainId } from '@/dex/types/main.types'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { scanAddressPath, scanTxPath } from '@ui/utils'
import {
  type PoolLiquidityRow,
  createPoolLiquidityColumns,
  usePoolActivityVisibility,
  useManualPagination,
  DEFAULT_PAGE_SIZE,
} from '@ui-kit/features/activity-table'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { useCombinedQueries } from '@ui-kit/lib/queries/combine'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { fakeLoadingQ } from '@ui-kit/types/util'
import { getPageCount } from '@ui-kit/utils'

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

  const poolPriceApi = usePoolsPricesApi({ blockchainId: network })
  const { data: pricesApiPoolsMapper } = poolPriceApi
  const poolTokens = useMemo(
    () => pricesApiPoolsMapper?.[poolAddress]?.coins ?? [],
    [pricesApiPoolsMapper, poolAddress],
  )
  const { liquidityColumnVisibility } = usePoolActivityVisibility({ poolTokens })

  const poolLiquidityEvents = usePoolLiquidityEvents({
    chain: network,
    poolAddress,
    page: apiPage,
    perPage: DEFAULT_PAGE_SIZE,
  })
  const { data: liquidityData } = poolLiquidityEvents

  const pageCount = getPageCount(liquidityData?.count, DEFAULT_PAGE_SIZE)

  // Transform liquidity data with block explorer URLs and pool tokens
  const liquidityWithUrls = useCombinedQueries(
    [poolLiquidityEvents, poolPriceApi, fakeLoadingQ(isHydrated || undefined)],
    useCallback(
      liquidityData =>
        network &&
        liquidityData.events.map(event => ({
          ...event,
          providerUrl: scanAddressPath(networkConfig, event.provider),
          txUrl: scanTxPath(networkConfig, event.txHash),
          network,
          poolTokens,
        })),
      [network, networkConfig, poolTokens],
    ),
  )

  const liquidityColumns = useMemo(
    () => createPoolLiquidityColumns({ blockchainId: network, poolTokens }),
    [network, poolTokens],
  )

  const table = useTable({
    query: liquidityWithUrls,
    columns: liquidityColumns,
    state: { columnVisibility: liquidityColumnVisibility, pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
    ...getTableOptions<PoolLiquidityRow>(liquidityWithUrls.data),
  })

  return {
    table,
    emptyState: { title: t`No liquidity data found.` },
    errorState: { title: t`Could not load liquidity data.` },
  }
}
