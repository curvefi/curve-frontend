import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { formatNumber } from '@evm-ui/utils'
import Typography from '@mui/material/Typography'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import type { PoolRow } from '../types'
import { formatCellValue } from './utils'

export const UsdCell = ({ getValue }: CellContext<PoolRow, number | null | undefined>) => {
  const value = getValue()

  return (
    <Tooltip title={maybe(value, value => formatNumber(value, 'usd.amount'))}>
      <Typography data-testid="pool-usd-value" variant="tableCellMBold">
        {formatCellValue(value, 'usd.notional')}
      </Typography>
    </Tooltip>
  )
}
