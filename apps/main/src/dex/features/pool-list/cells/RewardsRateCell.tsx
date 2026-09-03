import { t } from '@evm-ui/lib/i18n'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { WithWrapper } from '@evm-ui/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { PoolRow } from '../types'
import { RewardIcons } from './RewardIcons'
import { RewardsRateTooltipContent } from './RewardsRateTooltipContent'
import { formatCellValue, getRewardsApr } from './utils'

const { Spacing } = SizesAndSpaces

export const RewardsRateCell = ({ pool }: { pool: PoolRow }) => {
  const rewardsApr = getRewardsApr(pool)

  return (
    <Stack sx={{ alignItems: 'flex-end', gap: Spacing.xs }}>
      <WithWrapper
        shouldWrap={rewardsApr}
        Wrapper={Tooltip}
        clickable
        title={t`Rewards APR`}
        body={<RewardsRateTooltipContent pool={pool} />}
        placement="top"
      >
        <Box component="span" sx={{ display: 'inline-flex' }}>
          <Typography variant="tableCellMBold">{formatCellValue(rewardsApr, 'percent.rate')}</Typography>
        </Box>
      </WithWrapper>
      <RewardIcons pool={pool} />
    </Stack>
  )
}
