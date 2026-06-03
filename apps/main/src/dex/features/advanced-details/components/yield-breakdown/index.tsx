import { useMemo } from 'react'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { LegacyDataTable } from '@ui-kit/shared/ui/DataTable/LegacyDataTable'
import { useYieldBreakdown } from '../../hooks/useYieldBreakdown'
import { createYieldBreakdownColumns, type YieldBreakdownRow } from './columns/columns.definitions'
import { FooterRow } from './FooterRow'

export const YieldBreakdown = ({
  chainId,
  poolDataCacheOrApi,
  poolId,
}: {
  chainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
  poolId: string
}) => {
  const { dailyBaseTotal, dailyTotal, rows, showPointsMultiplier } = useYieldBreakdown({
    chainId,
    poolDataCacheOrApi,
    poolId,
  })
  const columns = useMemo(() => createYieldBreakdownColumns({ showPointsMultiplier }), [showPointsMultiplier])
  const table = useTable({
    data: rows,
    columns,
    ...getTableOptions(rows),
  })

  if (rows.length === 0) return null

  return (
    <Stack>
      <CardHeader title={t`Yield Breakdown`} size="small" />
      <LegacyDataTable<YieldBreakdownRow>
        table={table}
        size="small"
        loading={false}
        emptyState={<EmptyStateRow table={table} size="sm">{t`No yield breakdown found.`}</EmptyStateRow>}
        footerRow={
          dailyTotal && (
            <FooterRow
              dailyBaseTotal={dailyBaseTotal}
              dailyTotal={dailyTotal}
              showPointsMultiplier={showPointsMultiplier}
            />
          )
        }
      />
    </Stack>
  )
}
