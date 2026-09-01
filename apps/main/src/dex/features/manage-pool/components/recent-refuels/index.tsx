import { useMemo } from 'react'
import type { Address } from 'viem'
import type { ChainId } from '@/dex/types/main.types'
import type { Chain } from '@curvefi/prices-api'
import { useManualPagination } from '@evm-ui/features/activity-table'
import { t } from '@evm-ui/lib/i18n'
import { useCurveTable } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@evm-ui/shared/ui/DataTable/DataTable'
import { mapQuery } from '@evm-ui/types/util'
import { getPageCount } from '@evm-ui/utils'
import { scanAddressPath } from '@legacy-ui/utils'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { RECENT_REFUELS_PAGE_SIZE, useRecentRefuels } from '../../queries/recent-refuels.query'
import { createRecentRefuelsColumns } from './columns/columns.definitions'

export const RecentRefuels = ({
  chainId,
  blockchainId,
  poolAddress,
}: {
  chainId: ChainId
  blockchainId: Chain
  poolAddress: Address
}) => {
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
  const table = useCurveTable({
    columns,
    query: mapQuery(recentRefuels, ({ data: events }) =>
      events.map(event => ({
        ...event,
        donorUrl: event.donor ? scanAddressPath(chainId, event.donor) : undefined,
      })),
    ),
    state: { pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
  })

  return (
    <Stack data-testid="refuel-recent-refuels">
      <CardHeader title={t`Recent Refuels`} size="small" />
      <DataTable
        table={table}
        emptyState={{ title: t`No recent refuels found` }}
        errorState={{ title: t`Could not load recent refuels` }}
      />
    </Stack>
  )
}
