import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { PoolRow } from '../types'
import { RewardIcons } from './RewardIcons'
import { RewardsApyTooltipContent } from './RewardsApyTooltipContent'
import { formatCellValue, getRewardsApy } from './utils'

const { Spacing } = SizesAndSpaces

export const RewardsApyCell = ({ pool }: { pool: PoolRow }) => {
  const rewardsApy = getRewardsApy(pool)

  return (
    <Stack data-testid="pool-rewards-apy" sx={{ alignItems: 'flex-end', gap: Spacing.xs }}>
      <WithWrapper
        shouldWrap={rewardsApy}
        Wrapper={Tooltip}
        clickable
        title={t`Rewards APY`}
        body={<RewardsApyTooltipContent pool={pool} />}
        placement="top"
      >
        <Box
          component="span"
          data-testid={rewardsApy ? 'pool-rewards-apy-tooltip-trigger' : undefined}
          sx={{ display: 'inline-flex' }}
        >
          <Typography variant="tableCellMBold">{formatCellValue(getRewardsApy(pool), 'percent.rate')}</Typography>
        </Box>
      </WithWrapper>
      <RewardIcons pool={pool} />
    </Stack>
  )
}
