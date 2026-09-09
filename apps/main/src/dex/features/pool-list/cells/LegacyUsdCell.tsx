import Stack from '@mui/material/Stack'
import { formatNumber } from '@primitives/number.utils'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui/components/Tooltip'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import type { LegacyPoolRow } from '../types'

export const LegacyUsdCell = ({ getValue }: CellContext<CurveTableFeatures, LegacyPoolRow, number | null>) => {
  const value = getValue()
  return (
    <Tooltip title={value && formatNumber(value, 'usd.amount')}>
      <Stack>{value == null ? '-' : formatNumber(value, 'usd.notional')}</Stack>
    </Tooltip>
  )
}
