import { formatPercent, getRewardsAction } from '@/loan/components/PageLlamaMarkets/cells/cell.format'
import { RateTooltipContent } from '@/loan/components/PageLlamaMarkets/cells/RateCellTooltip'
import { RateType } from '@/loan/components/PageLlamaMarkets/hooks/useSnapshots'
import { LlamaMarket } from '@/loan/entities/llama-markets'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { PointsIcon } from '@ui-kit/shared/icons/PointsIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useSnapshots } from '../hooks/useSnapshots'

const { IconSize, Spacing } = SizesAndSpaces

export const RateCell = ({ market, type }: { market: LlamaMarket; type: RateType }) => {
  const { rate, averageRate, period } = useSnapshots(market, type)
  const { rewards, type: marketType } = market
  const rewardsAction = getRewardsAction(marketType, type)
  const poolRewards = rewards.filter(({ action }) => action == rewardsAction)
  return (
    <Tooltip
      title={
        <RateTooltipContent type={type} rate={rate} averageRate={averageRate} rewards={poolRewards} period={period} />
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
              icon={<PointsIcon sx={{ width: IconSize.xs, height: IconSize.xs }} />}
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
