import { useMemo } from 'react'
import type { Address } from 'viem'
import { useNetworkByChain } from '@/dex/entities/networks'
import type { ChainId } from '@/dex/types/main.types'
import type { Chain } from '@curvefi/prices-api'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { scanAddressPath } from '@ui/utils'
import { useManualPagination, getPageCount } from '@ui-kit/features/activity-table'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { LegacyDataTable } from '@ui-kit/shared/ui/DataTable/LegacyDataTable'
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

  const { data, isLoading, isFetching, error } = useRecentRefuels({
    blockchainId,
    poolAddress,
    page: apiPage,
    pageSize: RECENT_REFUELS_PAGE_SIZE,
  })

  const rows = useMemo<RecentRefuelRow[]>(
    () =>
      data?.data.map(event => ({
        ...event,
        donorUrl: event.donor ? scanAddressPath(networkConfig, event.donor) : undefined,
      })) ?? [],
    [data?.data, networkConfig],
  )
  const columns = useMemo(() => createRecentRefuelsColumns(data?.tokens ?? []), [data?.tokens])
  const pageCount = getPageCount(data?.count, RECENT_REFUELS_PAGE_SIZE)
  const table = useTable({
    data: rows,
    columns,
    state: { pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
    ...getTableOptions(rows),
  })

  return (
    <Stack data-testid="refuel-recent-refuels">
      <CardHeader title={t`Recent Refuels`} size="small" />
      <LegacyDataTable<RecentRefuelRow>
        table={table}
        emptyState={
          <EmptyStateRow table={table}>
            {error ? t`Could not load recent refuels: ${error.message}` : t`No recent refuels found.`}
          </EmptyStateRow>
        }
        loading={isLoading || isFetching}
      />
    </Stack>
  )
}
