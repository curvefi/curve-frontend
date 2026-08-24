import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { formatNumber } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import type { CellContext } from '@tanstack/react-table'
import type { LegacyPoolRow } from '../types'

export const LegacyUsdCell = ({ getValue }: CellContext<LegacyPoolRow, number | null>) => {
  const value = getValue()
  return (
    <Tooltip title={value && formatNumber(value, 'usd.amount')}>
      <Stack>{value == null ? '-' : formatNumber(value, 'usd.notional')}</Stack>
    </Tooltip>
  )
}
