import Typography, { type TypographyProps } from '@mui/material/Typography'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { formatDate } from '@ui/utils'
import { useCurrentDate } from '@ui-kit/hooks/useCurrentDate'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { relativeTime } from '@ui-kit/utils/time.utils'
import type { PoolRow } from '../types'

type AgeValueProps = {
  creationDate: PoolRow['creationDate']
  textAlign?: 'start' | 'end'
  typographyVariant?: TypographyProps['variant']
}

export const AgeValue = ({ creationDate, textAlign = 'end', typographyVariant = 'tableCellMBold' }: AgeValueProps) => {
  const currentDate = useCurrentDate()

  return (
    <WithWrapper
      shouldWrap={creationDate != null}
      Wrapper={Tooltip}
      title={maybe(creationDate, date => formatDate(date, 'long'))}
      placement="top"
    >
      <Typography data-testid="pool-age" variant={typographyVariant} sx={{ textAlign }}>
        {creationDate == null ? '-' : relativeTime(currentDate.getTime(), creationDate)}
      </Typography>
    </WithWrapper>
  )
}

export const AgeCell = ({ getValue }: CellContext<PoolRow, PoolRow['creationDate']>) => (
  <AgeValue creationDate={getValue()} />
)
