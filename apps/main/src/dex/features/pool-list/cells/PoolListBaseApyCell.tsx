import { ChipVolatileBaseApy } from '@/dex/components/ChipVolatileBaseApy'
import { TooltipBaseApy } from '@/dex/components/TooltipBaseApy'
import { LARGE_APY } from '@/dex/constants'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { formatNumber } from '@ui-kit/utils'
import type { PoolListItem } from '../poolList.types'

export const PoolListBaseApyCell = ({
  row: { original: pool },
  getValue,
}: CellContext<PoolListItem, number | null | undefined>) => {
  const baseDailyApr = getValue()

  return baseDailyApr != null && baseDailyApr > LARGE_APY ? (
    <ChipVolatileBaseApy />
  ) : baseDailyApr == null ? (
    <Typography component="span" variant="tableCellMBold">
      {formatNumber(baseDailyApr, 'percent.rate')}
    </Typography>
  ) : (
    <Tooltip title={<TooltipBaseApy baseDailyApr={baseDailyApr} baseWeeklyApr={pool.baseWeeklyApr} />}>
      <Typography component="span" variant="tableCellMBold">
        {formatNumber(baseDailyApr, 'percent.rate')}
      </Typography>
    </Tooltip>
  )
}
