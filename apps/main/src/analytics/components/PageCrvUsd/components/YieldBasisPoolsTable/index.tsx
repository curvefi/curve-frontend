import { useMemo } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import { getCoreRowModel, getSortedRowModel } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { LegacyDataTable } from '@ui-kit/shared/ui/DataTable/LegacyDataTable'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { YieldBasisPoolRow } from '../../types'
import { YieldBasisPoolsFooterRow } from './cells'
import { YIELD_BASIS_POOL_COLUMNS } from './columns'

const { Spacing } = SizesAndSpaces

const INITIAL_STATE = {
  sorting: [{ id: 'totalVolume7d', desc: true }],
}

export const YieldBasisPoolsTable = ({
  rows,
  loading,
  volume24h,
  volume7d,
}: {
  rows: YieldBasisPoolRow[]
  loading: boolean
  volume24h?: number
  volume7d?: number
}) => {
  const data = useMemo(() => rows, [rows])
  const table = useTable({
    columns: YIELD_BASIS_POOL_COLUMNS,
    data,
    initialState: INITIAL_STATE,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    pageCount: 1,
  })

  return (
    <Card size="small">
      <CardHeader title={t`YieldBasis Pools`} />
      <CardContent sx={{ padding: 0, '&:last-child': { paddingBottom: 0 } }}>
        <LegacyDataTable
          table={table}
          loading={loading}
          disableStickyHeader
          emptyState={
            <EmptyStateRow table={table}>
              <Typography variant="bodyMRegular" color="textSecondary" padding={Spacing.md}>
                {t`No YieldBasis pools found`}
              </Typography>
            </EmptyStateRow>
          }
          footerRow={
            <YieldBasisPoolsFooterRow
              volume24h={volume24h}
              volume7d={volume7d}
              colSpan={table.getAllLeafColumns().length}
            />
          }
        />
      </CardContent>
    </Card>
  )
}
