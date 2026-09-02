import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import { t } from '@evm-ui/lib/i18n'
import { useCurveTable } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@evm-ui/shared/ui/DataTable/DataTable'
import type { QueryProp } from '@evm-ui/types/util'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { usePointsCampaigns } from '../../hooks/usePointsCampaigns'
import { POINTS_CAMPAIGNS_COLUMNS } from './columns/columns.definitions'

export const PointsCampaigns = ({
  chainId,
  poolQuery,
}: {
  chainId: ChainId
  poolQuery: QueryProp<PoolDataCacheOrApi | undefined>
}) => {
  const { query, rows } = usePointsCampaigns({
    chainId,
    poolQuery,
  })
  const table = useCurveTable({
    query,
    columns: POINTS_CAMPAIGNS_COLUMNS,
  })

  return (
    (poolQuery.isLoading || rows.length > 0) && (
      <Stack>
        <CardHeader title={t`Points Campaigns`} size="small" />
        <DataTable category="detail" table={table} emptyState={{ title: t`No points campaigns found` }} />
      </Stack>
    )
  )
}
