import Stack from '@mui/material/Stack'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { formatNumber } from '@ui-kit/utils'
import type { LegacyPoolListItem } from '../legacy-pools.types'

export const LegacyUsdCell = ({ getValue }: CellContext<LegacyPoolListItem, number | null>) => {
  const value = getValue()
  return (
    <Tooltip title={value && formatNumber(value, 'usd.amount')}>
      <Stack>{value == null ? '-' : formatNumber(value, 'usd.notional')}</Stack>
    </Tooltip>
  )
}
