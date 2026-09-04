import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Tooltip } from '@ui/components/Tooltip'
import { WithWrapper } from '@ui/components/WithWrapper'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import type { PoolRow } from '../types'
import { RewardIcons } from './RewardIcons'
import { RewardsRateTooltipContent } from './RewardsRateTooltipContent'
import { formatCellValue, getRewardsApr } from './utils'

const { Spacing } = SizesAndSpaces

export const RewardsRateCell = ({ pool }: { pool: PoolRow }) => {
  const rewardsRate = getRewardsApr(pool)

  return (
    <Stack sx={{ alignItems: 'flex-end', gap: Spacing.xs }}>
      <WithWrapper
        shouldWrap={rewardsRate}
        Wrapper={Tooltip}
        clickable
        title={t`Rewards APR`}
        body={<RewardsRateTooltipContent pool={pool} />}
        placement="top"
      >
        <Box component="span" sx={{ display: 'inline-flex' }}>
          <Typography variant="tableCellMBold">{formatCellValue(rewardsRate, 'percent.rate')}</Typography>
        </Box>
      </WithWrapper>
      <RewardIcons pool={pool} />
    </Stack>
  )
}
