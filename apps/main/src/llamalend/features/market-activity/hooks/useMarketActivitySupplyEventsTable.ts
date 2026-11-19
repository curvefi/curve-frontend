import { getActivityToken } from '@/llamalend/llama.utils'
import { useMarketSupplyEvents } from '@/llamalend/queries/market/market-supply-events.query'
import { ACTIVITY_COLUMNS } from '@evm-ui/features/activity-table/columns/columns.definitions'
import { useActivityVisibility } from '@evm-ui/features/activity-table/hooks/useActivityVisibility'
import { useManualPagination } from '@evm-ui/features/activity-table/hooks/useManualPagination'
import { DEFAULT_PAGE_SIZE } from '@evm-ui/features/activity-table/utils'
import { getPageCount } from '@evm-ui/utils'
import { mapQuery } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'
import type { MarketSupplyActivityProps } from '../types'
import { toMarketActivitySupplyEventRow } from '../utils'

export const useMarketActivitySupplyEventsTable = ({
  chainId,
  blockchainId,
  borrowToken,
  vaultToken,
}: MarketSupplyActivityProps) => {
  const columnVisibility = useActivityVisibility({ hasValue: false })
  const { pagination, onPaginationChange, apiPage: page } = useManualPagination()
  const eventsQuery = useMarketSupplyEvents({
    blockchainId,
    contractAddress: vaultToken?.address,
    page,
    perPage: DEFAULT_PAGE_SIZE,
  })
  const query = mapQuery(eventsQuery, ({ events }) => {
    const assets = getActivityToken(blockchainId, borrowToken)
    const shares = getActivityToken(blockchainId, vaultToken)
    return events.map(event =>
      toMarketActivitySupplyEventRow({ ...event, chainId, blockchainId, borrowToken: assets, vaultToken: shares }),
    )
  })

  return {
    table: useCurveTable({
      query,
      columns: ACTIVITY_COLUMNS,
      state: { columnVisibility, pagination },
      manualPagination: true,
      pageCount: getPageCount(eventsQuery.data?.count, DEFAULT_PAGE_SIZE),
      onPaginationChange,
    }),
    emptyState: { title: t`No activity data found.` },
    errorState: { title: t`Could not load activity data.` },
  }
}
