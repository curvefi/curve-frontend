import { useCallback } from 'react'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolTrades } from '@/dex/entities/pool-trades.query'
import { usePoolPricesApi } from '@/dex/queries/pools-prices-api.query'
import { ChainId } from '@/dex/types/main.types'
import { getBlockchainId } from '@curvefi/prices-api'
import {
  POOL_TRADES_COLUMNS,
  usePoolActivityVisibility,
  useManualPagination,
  DEFAULT_PAGE_SIZE,
} from '@evm-ui/features/activity-table'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { t } from '@evm-ui/lib/i18n'
import { useCombinedQueries } from '@evm-ui/lib/queries/combine'
import { useCurveTable } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { getPageCount } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import { maybe } from '@primitives/objects.utils'
import { fakeLoadingQ, mapQuery } from '@ui/features/queries/util'

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
  const network = getBlockchainId(networkConfig?.id)
  const { isHydrated } = useCurve()
  const { pagination, onPaginationChange, apiPage } = useManualPagination()

  const poolPriceApi = usePoolPricesApi({ blockchainId: network, poolAddress })

  const { data: poolTokens = [] } = mapQuery(poolPriceApi, pool => pool.coins)
  const { tradesColumnVisibility } = usePoolActivityVisibility({ poolTokens })

  const poolTrades = usePoolTrades({
    chain: network,
    poolAddress,
    page: apiPage,
    perPage: DEFAULT_PAGE_SIZE,
  })
  const { data: tradesData } = poolTrades

  const pageCount = getPageCount(tradesData?.count, DEFAULT_PAGE_SIZE)

  // Transform trades data with block explorer URLs
  const tradesWithUrls = useCombinedQueries(
    [poolTrades, poolPriceApi, fakeLoadingQ(isHydrated || undefined)],
    useCallback(
      tradesData =>
        maybe(network, blockchainId => tradesData.trades.map(trade => ({ ...trade, chainId, blockchainId }))),
      [chainId, network],
    ),
  )

  const table = useCurveTable({
    query: tradesWithUrls,
    columns: POOL_TRADES_COLUMNS,
    state: { columnVisibility: tradesColumnVisibility, pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
  })

  return {
    table,
    emptyState: { title: t`No swap data found.` },
    errorState: { title: t`Could not load swap data.` },
  }
}
