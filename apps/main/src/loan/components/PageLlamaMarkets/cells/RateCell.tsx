import { useRef } from 'react'
import { getRewardsDescription } from '@/loan/components/PageLlamaMarkets/cells/MarketTitleCell/cell.utils'
import { GraphType } from '@/loan/components/PageLlamaMarkets/hooks/useSnapshots'
import { LlamaMarket, LlamaMarketType } from '@/loan/entities/llama-markets'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { RewardsAction } from '@ui/CampaignRewards/types'
import useIntersectionObserver from '@ui-kit/hooks/useIntersectionObserver'
import { t } from '@ui-kit/lib/i18n'
import { RewardIcon } from '@ui-kit/shared/ui/RewardIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useSnapshots } from '../hooks/useSnapshots'

const { Spacing } = SizesAndSpaces

export const RateCell = ({ market, type }: { market: LlamaMarket; type: GraphType }) => {
  const ref = useRef<HTMLDivElement>(null)
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: true })
  const { rate, averageRate } = useSnapshots(market, type, entry?.isIntersecting)
  const { rewards, type: marketType } = market
  const rewardsAction: RewardsAction =
    marketType === LlamaMarketType.Mint ? 'loan' : type == 'borrow' ? 'borrow' : 'supply'
  return (
    <Stack gap={Spacing.xs} ref={ref}>
      <Tooltip title={t`Average rate`} placement="top">
        <Typography variant="tableCellMBold" color="textPrimary">
          {averageRate != null && `${averageRate.toPrecision(4)}%`}
        </Typography>
      </Tooltip>

      <Stack direction="row" gap={Spacing.xs} alignSelf="end">
        {rate != null && (
          <Tooltip title={t`Current rate`} placement="top">
            <Typography variant="bodySRegular" color="textSecondary" sx={{ alignSelf: 'center' }}>
              {rate.toPrecision(4)}%
            </Typography>
          </Tooltip>
        )}
        {rate != null &&
          rewards
            .filter(({ action }) => action == rewardsAction)
            .map((reward, index) => (
              <Tooltip
                key={index}
                title={getRewardsDescription(reward)}
                placement="top"
                data-testid={`rewards-${type}-${reward.action}`}
              >
                <Chip
                  icon={<RewardIcon imageId={reward.platformImageId} />}
                  size="extraSmall"
                  color="highlight"
                  label={reward.multiplier}
                />
              </Tooltip>
            ))}
      </Stack>
    </Stack>
  )
}
