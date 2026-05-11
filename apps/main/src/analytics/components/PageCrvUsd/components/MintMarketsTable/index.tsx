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
import type { MintMarketRow } from '../../types'
import { MINT_MARKET_COLUMNS } from './columns'

const { Spacing } = SizesAndSpaces

const INITIAL_STATE = {
  sorting: [{ id: 'borrowedUsd', desc: true }],
}

export const MintMarketsTable = ({ rows, loading }: { rows: MintMarketRow[]; loading: boolean }) => {
  const data = useMemo(() => rows, [rows])
  const table = useTable({
    columns: MINT_MARKET_COLUMNS,
    data,
    initialState: INITIAL_STATE,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    pageCount: 1,
  })

  return (
    <Card size="small">
      <CardHeader title={t`Mint Markets`} />
      <CardContent sx={{ padding: 0 }}>
        <LegacyDataTable
          table={table}
          loading={loading}
          disableStickyHeader
          emptyState={
            <EmptyStateRow table={table}>
              <Typography variant="bodyMRegular" color="textSecondary" padding={Spacing.md}>
                {t`No mint markets found`}
              </Typography>
            </EmptyStateRow>
          }
        />
      </CardContent>
    </Card>
  )
}
