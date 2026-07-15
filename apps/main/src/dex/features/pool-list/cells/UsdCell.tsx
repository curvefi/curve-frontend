import Typography from '@mui/material/Typography'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { formatNumber } from '@ui-kit/utils'
import type { PoolListItem } from '../pools.types'

export const UsdCell = ({ getValue }: CellContext<PoolListItem, number | null | undefined>) => {
  const value = getValue()

  return (
    <Tooltip title={maybe(value, value => formatNumber(value, 'usd.amount'))}>
      <Typography component="span" variant="tableCellMBold">
        {formatNumber(value, 'usd.notional')}
      </Typography>
    </Tooltip>
  )
}
