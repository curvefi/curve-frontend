import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { formatNumber } from '@evm-ui/utils'
import Typography from '@mui/material/Typography'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui/components/Tooltip'
import type { PoolRow } from '../types'
import { formatCellValue } from './utils'

export const UsdCell = ({
  getValue,
}: CellContext<CurveTableFeatures, PoolRow, PoolRow['tradingVolume24h' | 'tvlUsd']>) => {
  const value = getValue()

  return (
    <Tooltip title={maybe(value, value => formatNumber(value, 'usd.amount'))}>
      <Typography data-testid="pool-usd-value" variant="tableCellMBold">
        {formatCellValue(value, 'usd.notional')}
      </Typography>
    </Tooltip>
  )
}
