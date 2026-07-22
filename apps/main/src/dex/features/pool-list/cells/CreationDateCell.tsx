import Typography, { type TypographyProps } from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { formatDate } from '@ui/utils'
import type { PoolRow } from '../types'

type CreationDateValueProps = {
  creationDate: PoolRow['creationDate']
  textAlign?: 'start' | 'end'
  typographyVariant?: TypographyProps['variant']
}

export const CreationDateValue = ({
  creationDate,
  textAlign = 'end',
  typographyVariant = 'tableCellMBold',
}: CreationDateValueProps) => (
  <Typography data-testid="pool-creation-date" variant={typographyVariant} sx={{ textAlign }}>
    {creationDate == null ? '-' : formatDate(creationDate, 'short')}
  </Typography>
)

export const CreationDateCell = ({ getValue }: CellContext<PoolRow, PoolRow['creationDate']>) => (
  <CreationDateValue creationDate={getValue()} />
)
