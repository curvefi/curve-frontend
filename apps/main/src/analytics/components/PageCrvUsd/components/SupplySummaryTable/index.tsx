import { useMemo } from 'react'
import type { CrvUsdYieldBasisSupply } from '@curvefi/prices-api/yield-basis'
import Typography from '@mui/material/Typography'
import { getCoreRowModel } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { LegacyDataTable } from '@ui-kit/shared/ui/DataTable/LegacyDataTable'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ScrvUsdFooterRow } from './cells'
import { SUPPLY_SUMMARY_COLUMNS } from './columns'
import type { SupplySummaryRow } from './columns/columns.definitions'

const { Spacing } = SizesAndSpaces

export const SupplySummaryTable = ({
  supply,
  scrvUsdSupply,
  loading,
}: {
  supply: CrvUsdYieldBasisSupply | undefined
  scrvUsdSupply: number | undefined
  loading: boolean
}) => {
  const ybPressure = supply == null ? undefined : supply.ybTotalAmmDebt - supply.ybTotalAmmBalance
  const ybPressurePct = supply?.ybTotalAmmBalance ? (100 * (ybPressure ?? 0)) / supply.ybTotalAmmBalance : undefined
  const data = useMemo<SupplySummaryRow[]>(
    () => [
      {
        label: t`YieldBasis AMM Debt`,
        value: supply?.ybTotalAmmDebt,
        total: supply?.totalSupply,
        loading,
        url: null,
      },
      {
        label: t`YB Pool Balance`,
        value: supply?.ybTotalAmmBalance,
        loading,
        url: null,
      },
      {
        label: t`YB Pressure`,
        value: ybPressure,
        percentage: ybPressurePct,
        showSign: true,
        loading,
        url: null,
      },
      {
        label: t`Mint Markets`,
        value: supply?.mintMarketDebt,
        total: supply?.totalSupply,
        loading,
        url: null,
      },
      {
        label: t`PegKeepers`,
        value: supply?.mintPegkeeperDebt,
        total: supply?.totalSupply,
        loading,
        url: null,
      },
    ],
    [loading, supply, ybPressure, ybPressurePct],
  )
  const table = useTable({
    columns: SUPPLY_SUMMARY_COLUMNS,
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
            {t`No supply data found`}
          </Typography>
        </EmptyStateRow>
      }
      footerRow={<ScrvUsdFooterRow value={scrvUsdSupply} loading={loading} />}
    />
  )
}
