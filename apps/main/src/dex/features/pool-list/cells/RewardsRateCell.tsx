import { useAprToApy, useRateDisplay } from '@evm-ui/hooks/useAprToApy'
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
import { formatCellValue, getRewardsRate } from './utils'

const { Spacing } = SizesAndSpaces

export const RewardsRateCell = ({ pool }: { pool: PoolRow }) => {
  const convertAprToApy = useAprToApy()
  const rateDisplay = useRateDisplay()
  const rewardsRate = getRewardsRate(pool, convertAprToApy)

  return (
    <Stack data-testid="pool-rewards-rate" sx={{ alignItems: 'flex-end', gap: Spacing.xs }}>
      <WithWrapper
        shouldWrap={rewardsRate}
        Wrapper={Tooltip}
        clickable
        title={rateDisplay === 'apy' ? t`Rewards APY` : t`Rewards APR`}
        body={<RewardsRateTooltipContent pool={pool} />}
        placement="top"
      >
        <Box
          component="span"
          data-testid={rewardsRate ? 'pool-rewards-rate-tooltip-trigger' : undefined}
          sx={{ display: 'inline-flex' }}
        >
          <Typography variant="tableCellMBold">{formatCellValue(rewardsRate, 'percent.rate')}</Typography>
        </Box>
      </WithWrapper>
      <RewardIcons pool={pool} />
    </Stack>
  )
}
