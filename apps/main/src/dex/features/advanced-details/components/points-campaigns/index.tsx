import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { usePointsCampaigns } from '../../hooks/usePointsCampaigns'
import { POINTS_CAMPAIGNS_COLUMNS, type PointsCampaignsRow } from './columns/columns.definitions'

export const PointsCampaigns = ({
  chainId,
  poolDataCacheOrApi,
}: {
  chainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
}) => {
  const { rows } = usePointsCampaigns({
    chainId,
    poolDataCacheOrApi,
  })
  const table = useTable({
    data: rows,
    columns: POINTS_CAMPAIGNS_COLUMNS,
    ...getTableOptions(rows),
  })

  return (
    rows.length > 0 && (
      <Stack>
        <CardHeader title={t`Points Campaigns`} size="small" />
        <DataTable<PointsCampaignsRow>
          table={table}
          size="small"
          isLoading={false}
          disableStickyHeader
          emptyState={<EmptyStateRow table={table} size="sm">{t`No points campaigns found.`}</EmptyStateRow>}
        />
      </Stack>
    )
  )
}
