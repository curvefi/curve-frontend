import { useCallback, useMemo } from 'react'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolLiquidityEvents } from '@/dex/entities/pool-liquidity.query'
import { usePoolPricesApi } from '@/dex/queries/pools-prices-api.query'
import { ChainId } from '@/dex/types/main.types'
import { getBlockchainId } from '@curvefi/prices-api'
import {
  createPoolLiquidityColumns,
  usePoolActivityVisibility,
  useManualPagination,
  DEFAULT_PAGE_SIZE,
} from '@evm-ui/features/activity-table'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { t } from '@evm-ui/lib/i18n'
import { useCombinedQueries } from '@evm-ui/lib/queries/combine'
import { useCurveTable } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { fakeLoadingQ, mapQuery } from '@evm-ui/types/util'
import { getPageCount } from '@evm-ui/utils'
import { scanAddressPath, scanTxPath } from '@legacy-ui/utils'
import type { Address } from '@primitives/address.utils'

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
  const network = getBlockchainId(networkConfig?.id)
  const { pagination, onPaginationChange, apiPage } = useManualPagination()

  const poolPriceApi = usePoolPricesApi({ blockchainId: network, poolAddress })

  const { data: poolTokens = [] } = mapQuery(poolPriceApi, pool => pool.coins)
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

  const table = useCurveTable({
    query: liquidityWithUrls,
    columns: liquidityColumns,
    state: { columnVisibility: liquidityColumnVisibility, pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
  })

  return {
    table,
    emptyState: { title: t`No liquidity data found.` },
    errorState: { title: t`Could not load liquidity data.` },
  }
}
