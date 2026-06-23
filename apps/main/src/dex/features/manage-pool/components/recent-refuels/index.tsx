import { useMemo } from 'react'
import type { Address } from 'viem'
import { useNetworkByChain } from '@/dex/entities/networks'
import type { ChainId } from '@/dex/types/main.types'
import type { Chain } from '@curvefi/prices-api'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { scanAddressPath } from '@ui/utils'
import { useManualPagination } from '@ui-kit/features/activity-table'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { mapQuery } from '@ui-kit/types/util'
import { getPageCount } from '@ui-kit/utils'
import { RECENT_REFUELS_PAGE_SIZE, useRecentRefuels } from '../../queries/recent-refuels.query'
import { createRecentRefuelsColumns, type RecentRefuelRow } from './columns/columns.definitions'

export const RecentRefuels = ({
  chainId,
  blockchainId,
  poolAddress,
}: {
  chainId: ChainId
  blockchainId: Chain
  poolAddress: Address
}) => {
  const { data: networkConfig } = useNetworkByChain({ chainId })
  const { pagination, onPaginationChange, apiPage } = useManualPagination(RECENT_REFUELS_PAGE_SIZE)

  const recentRefuels = useRecentRefuels({
    blockchainId,
    poolAddress,
    page: apiPage,
    pageSize: RECENT_REFUELS_PAGE_SIZE,
  })

  const columns = useMemo(
    () => createRecentRefuelsColumns(recentRefuels.data?.tokens ?? []),
    [recentRefuels.data?.tokens],
  )
  const pageCount = getPageCount(recentRefuels.data?.count, RECENT_REFUELS_PAGE_SIZE)
  const table = useTable({
    columns,
    query: mapQuery(recentRefuels, ({ data: events }) =>
      events.map(event => ({
        ...event,
        donorUrl: event.donor ? scanAddressPath(networkConfig, event.donor) : undefined,
      })),
    ),
    state: { pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
    ...getTableOptions<RecentRefuelRow>(recentRefuels.data?.data),
  })

  return (
    <Stack data-testid="refuel-recent-refuels">
      <CardHeader title={t`Recent Refuels`} size="small" />
      <DataTable<RecentRefuelRow>
        table={table}
        emptyState={{
          emptyTitle: t`No recent refuels found`,
          errorTitle: t`Could not load recent refuels`,
        }}
      />
    </Stack>
  )
}
