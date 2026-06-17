import { useMemo } from 'react'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { usePointsCampaigns } from '../../hooks/usePointsCampaigns'
import { createPointsCampaignsColumns, type PointsCampaignsRow } from './columns/columns.definitions'

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
  const isMobile = useIsMobile()
  const columns = useMemo(() => createPointsCampaignsColumns({ isMobile }), [isMobile])
  const table = useTable({ data: rows, columns, ...getTableOptions(rows) })

  return (
    rows.length > 0 && (
      <Stack>
        <CardHeader title={t`Points Campaigns`} size="small" />
        <DataTable<PointsCampaignsRow>
          table={table}
          disableStickyHeader
          emptyState={<EmptyStateRow table={table} size="sm">{t`No points campaigns found.`}</EmptyStateRow>}
        />
      </Stack>
    )
  )
}
