import Typography from '@mui/material/Typography'
import { formatDate } from '@primitives/date.utils'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui/components/Tooltip'
import { WithWrapper } from '@ui/components/WithWrapper'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import { relativeTime } from '@ui/lib/time'
import type { PoolRow } from '../types'

export const AgeCell = ({ getValue }: CellContext<CurveTableFeatures, PoolRow, PoolRow['creationDate']>) => {
  const creationDate = getValue()
  const currentDate = useCurrentDate()

  return (
    <WithWrapper
      shouldWrap={creationDate != null}
      Wrapper={Tooltip}
      title={maybe(creationDate, date => formatDate(date, 'long'))}
      placement="top"
    >
      <Typography data-testid="pool-age" variant="tableCellMBold" sx={{ textAlign: 'end' }}>
        {creationDate == null ? '-' : relativeTime(currentDate.getTime(), creationDate)}
      </Typography>
    </WithWrapper>
  )
}
