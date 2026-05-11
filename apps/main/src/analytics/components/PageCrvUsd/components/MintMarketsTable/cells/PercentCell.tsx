import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatNumber } from '@ui-kit/utils'
import type { MintMarketRow } from '../../../types'

export const PercentCell = ({ getValue }: CellContext<MintMarketRow, number>) => (
  <Typography variant="tableCellMRegular" textAlign="right">
    {formatNumber(getValue(), { unit: 'percentage', abbreviate: false })}
  </Typography>
)
