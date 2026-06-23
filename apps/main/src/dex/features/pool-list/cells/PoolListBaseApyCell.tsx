import { ChipVolatileBaseApy } from '@/dex/components/ChipVolatileBaseApy'
import { TooltipBaseApy } from '@/dex/components/TooltipBaseApy'
import { LARGE_APY } from '@/dex/constants'
import Typography from '@mui/material/Typography'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { formatNumber } from '@ui-kit/utils'
import type { PoolListItem } from '../poolList.types'

export const PoolListBaseApyCell = ({
  row: { original: pool },
  getValue,
}: CellContext<PoolListItem, PoolListItem['baseDailyApy']>) =>
  maybe(getValue(), baseDailyApy =>
    baseDailyApy > LARGE_APY ? (
      <ChipVolatileBaseApy />
    ) : (
      <Tooltip title={<TooltipBaseApy baseDailyApy={baseDailyApy} baseWeeklyApy={pool.baseWeeklyApy} />}>
        <Typography component="span" variant="tableCellMBold">
          {formatNumber(baseDailyApy, 'percent.rate')}
        </Typography>
      </Tooltip>
    ),
  ) ?? (
    <Typography component="span" variant="tableCellMBold">
      {formatNumber(null, 'percent.rate')}
    </Typography>
  )
