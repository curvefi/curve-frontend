import { useMemo } from 'react'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolTrades } from '@/dex/entities/pool-trades.query'
import { usePoolsPricesApi } from '@/dex/queries/pools-prices-api.query'
import { ChainId } from '@/dex/types/main.types'
import { getBlockchainId } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { scanAddressPath, scanTxPath } from '@ui/utils'
import {
  type PoolTradeRow,
  POOL_TRADES_COLUMNS,
  usePoolActivityVisibility,
  useManualPagination,
  DEFAULT_PAGE_SIZE,
} from '@ui-kit/features/activity-table'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { combineQueryState } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { getPageCount } from '@ui-kit/utils'

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

  const poolPriceApi = usePoolsPricesApi({ blockchainId: network })
  const { data: pricesApiPoolsMapper } = poolPriceApi
  const poolTokens = useMemo(
    () => pricesApiPoolsMapper?.[poolAddress]?.coins ?? [],
    [pricesApiPoolsMapper, poolAddress],
  )
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
  const tradesWithUrls: PoolTradeRow[] = useMemo(
    () =>
      (network &&
        tradesData?.trades.map(trade => ({
          ...trade,
          buyerUrl: scanAddressPath(networkConfig, trade.buyer),
          txUrl: scanTxPath(networkConfig, trade.txHash),
          network,
        }))) ??
      [],
    [tradesData?.trades, networkConfig, network],
  )

  const { error, isLoading } = combineQueryState(poolTrades, poolPriceApi)

  const table = useTable({
    data: tradesWithUrls,
    columns: POOL_TRADES_COLUMNS,
    state: { columnVisibility: tradesColumnVisibility, pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
    ...getTableOptions(tradesWithUrls),
  })

  return {
    table,
    isLoading: isLoading || !isHydrated,
    isError: !!error && isHydrated,
    emptyMessage: t`No swap data found.`,
    errorMessage: t`Could not load swap data.`,
  }
}
