import { LlamaMarket } from '@/loan/entities/llama-markets'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { RewardIcons } from '@ui-kit/shared/ui/RewardIcon'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { RateType, useSnapshots } from '../hooks/useSnapshots'
import { formatPercent, getRewardsAction } from './cell.format'
import { RateTooltipContent } from './RateCellTooltip'

const { Spacing } = SizesAndSpaces

export const RateCell = ({ market, type }: { market: LlamaMarket; type: RateType }) => {
  const { rate, averageRate, period } = useSnapshots(market, type)
  const { rewards, type: marketType } = market
  const rewardsAction = getRewardsAction(marketType, type)
  const poolRewards = rewards.filter(({ action }) => action == rewardsAction)
  return (
    <Tooltip
      title={
        {
          borrow: t`Borrow APR`,
          lend: t`Supply APR`,
        }[type]
      }
      body={
        <RateTooltipContent
          type={type}
          rate={rate}
          averageRate={averageRate}
          rewards={poolRewards}
          period={period}
          marketType={marketType}
        />
      }
      placement="top"
    >
      <Stack gap={Spacing.xs}>
        <Typography variant="tableCellMBold" color="textPrimary">
          {averageRate != null && formatPercent(averageRate)}
        </Typography>

        <Stack direction="row" gap={Spacing.xs} alignSelf="end">
          {rate != null && (
            <Typography variant="bodySRegular" color="textSecondary" sx={{ alignSelf: 'center' }}>
              {formatPercent(rate)}
            </Typography>
          )}
          {rate != null && poolRewards.length > 0 && (
            <Chip
              icon={<RewardIcons rewards={poolRewards} />}
              size="extraSmall"
              color="highlight"
              label={rewards.map((r) => r.multiplier).join(', ')}
            />
          )}
        </Stack>
      </Stack>
    </Tooltip>
  )
}
