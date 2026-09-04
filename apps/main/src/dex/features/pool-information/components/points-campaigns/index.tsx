import { usePoolContext } from '@/dex/features/pool-context'
import { useCurveTable } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@evm-ui/shared/ui/DataTable/DataTable'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { constQ } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { usePointsCampaigns } from '../../hooks/usePointsCampaigns'
import { POINTS_CAMPAIGNS_COLUMNS } from './columns/columns.definitions'

export const PointsCampaigns = () => {
  const { chainId, poolData } = usePoolContext()
  const { rows } = usePointsCampaigns({ chainId, poolData })
  const table = useCurveTable({
    query: constQ(rows), // TODO: get error and loading state properly
    columns: POINTS_CAMPAIGNS_COLUMNS,
  })

  return (
    rows.length > 0 && (
      <Stack>
        <CardHeader title={t`Points Campaigns`} size="small" />
        <DataTable category="detail" table={table} emptyState={{ title: t`No points campaigns found` }} />
      </Stack>
    )
  )
}
