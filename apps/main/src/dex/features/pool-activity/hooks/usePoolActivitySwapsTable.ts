import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolTrades } from '@/dex/entities/pool-trades.query'
import { usePoolContext } from '@/dex/features/pool-context'
import { getPricesApiBlockchainId } from '@curvefi/prices-api'
import { ACTIVITY_COLUMNS } from '@evm-ui/features/activity-table/columns/columns.definitions'
import { useActivityVisibility } from '@evm-ui/features/activity-table/hooks/useActivityVisibility'
import { useManualPagination } from '@evm-ui/features/activity-table/hooks/useManualPagination'
import { DEFAULT_PAGE_SIZE } from '@evm-ui/features/activity-table/utils'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { getPageCount } from '@evm-ui/utils'
import { maybe } from '@primitives/objects.utils'
import { useCombinedQueries } from '@ui/features/queries/combine'
import { loadingQ } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'
import { toPoolActivitySwapRow } from '../utils'

/** Create an ActivityTable for pool swap events. */
export const usePoolActivitySwapsTable = () => {
  const { chainId, poolAddress } = usePoolContext()
  const { data: networkConfig } = useNetworkByChain({ chainId })
  const network = getPricesApiBlockchainId(networkConfig?.blockchainId)
  const { isHydrated } = useCurve()
  const { pagination, onPaginationChange, apiPage } = useManualPagination()

  const columnVisibility = useActivityVisibility({ hasValue: true })

  const poolTrades = usePoolTrades({ blockchainId: network, poolAddress, page: apiPage, perPage: DEFAULT_PAGE_SIZE })
  const { data: tradesData } = poolTrades

  const pageCount = getPageCount(tradesData?.count, DEFAULT_PAGE_SIZE)

  const query = useCombinedQueries([poolTrades, loadingQ(isHydrated || undefined)], tradesData =>
    maybe(network, blockchainId =>
      tradesData.trades.map(trade => toPoolActivitySwapRow({ ...trade, chainId, blockchainId })),
    ),
  )

  const table = useCurveTable({
    query,
    columns: ACTIVITY_COLUMNS,
    state: { columnVisibility, pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
  })

  return { table, emptyState: { title: t`No swap data found.` }, errorState: { title: t`Could not load swap data.` } }
}
