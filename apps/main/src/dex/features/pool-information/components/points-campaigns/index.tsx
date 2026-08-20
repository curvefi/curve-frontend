import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { t } from '@evm-ui/lib/i18n'
import { getTableOptions, useTable } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@evm-ui/shared/ui/DataTable/DataTable'
import { constQ } from '@evm-ui/types/util'
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
    query: constQ(rows), // TODO: get error and loading state properly
    columns: POINTS_CAMPAIGNS_COLUMNS,
    ...getTableOptions(rows),
  })

  return (
    rows.length > 0 && (
      <Stack>
        <CardHeader title={t`Points Campaigns`} size="small" />
        <DataTable<PointsCampaignsRow>
          category="detail"
          table={table}
          emptyState={{ title: t`No points campaigns found` }}
        />
      </Stack>
    )
  )
}
