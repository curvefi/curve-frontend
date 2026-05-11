import { useMemo } from 'react'
import { PEG_KEEPERS } from '@/loan/components/PagePegKeepers/constants'
import { useStatistics } from '@/loan/components/PagePegKeepers/hooks/useStatistics'
import Typography from '@mui/material/Typography'
import { getCoreRowModel } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { LegacyDataTable } from '@ui-kit/shared/ui/DataTable/LegacyDataTable'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { PegKeepersFooterRow } from './cells'
import { PEG_KEEPER_COLUMNS } from './columns'
import type { PegKeeperTableRow } from './columns/columns.definitions'

const { Spacing } = SizesAndSpaces

export const PegKeepersTable = () => {
  const { totalDebt, totalCeiling, isFetchingDebt, isFetchingCeiling } = useStatistics()
  const data = useMemo<PegKeeperTableRow[]>(() => PEG_KEEPERS.map(pegkeeper => ({ pegkeeper, url: null })), [])
  const table = useTable({
    columns: PEG_KEEPER_COLUMNS,
    data,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <LegacyDataTable
      table={table}
      loading={false}
      hideHeader
      emptyState={
        <EmptyStateRow table={table} size="sm">
          <Typography variant="bodyMRegular" color="textSecondary" padding={Spacing.md}>
            {t`No PegKeepers found`}
          </Typography>
        </EmptyStateRow>
      }
      footerRow={
        <PegKeepersFooterRow
          totalDebt={totalDebt}
          totalCeiling={totalCeiling}
          loadingDebt={isFetchingDebt}
          loadingCeiling={isFetchingCeiling}
          keeperCount={PEG_KEEPERS.length}
        />
      }
    />
  )
}
