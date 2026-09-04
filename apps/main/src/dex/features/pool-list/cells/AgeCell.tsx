import { useCurrentDate } from '@evm-ui/hooks/useCurrentDate'
import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { formatDate } from '@legacy-ui/utils'
import Typography from '@mui/material/Typography'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui/components/Tooltip'
import { WithWrapper } from '@ui/components/WithWrapper'
import { relativeTime } from '@ui/utils/time'
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
