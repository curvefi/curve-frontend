import Stack from '@mui/material/Stack'
import { formatNumber } from '@primitives/number.utils'
import { Badge, type BadgeProps } from '@ui/components/Badge'
import { RewardIcon } from '@ui/components/RewardIcon'
import { Tooltip } from '@ui/components/Tooltip'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { LockClosedIcon } from '@ui/icons/LockClosedIcon'
import { aprToApy } from '@ui/lib/rates.utils'
import { CampaignTooltipContent } from './CampaignTooltipContent'
import type { CampaignRewards } from './types'

const { Spacing } = SizesAndSpaces

type CampaignRewardBadgeProps = {
  rewardsPool: CampaignRewards
  color?: BadgeProps['color']
  mobile?: boolean
  banner?: boolean
}

export const CampaignRewardBadge = ({ rewardsPool, color, mobile, banner }: CampaignRewardBadgeProps) => {
  const { platform, reward, platformImageId, action, symbol, lock, campaignName } = rewardsPool

  return (
    <Tooltip
      clickable
      mobileDrawer
      title={<CampaignTooltipContent campaign={rewardsPool} showRate={false} />}
      placement={mobile ? 'top' : banner ? 'left' : 'bottom'}
      slotProps={{ tooltip: { sx: { maxWidth: '25rem' } } }}
    >
      <Badge
        component="span"
        color={color}
        size="extraSmall"
        tabIndex={0}
        icon={<RewardIcon src={platformImageId} alt={platform} size="xs" />}
        label={
          <Stack component="span" direction="row" sx={{ alignItems: 'center', gap: Spacing.xxs }}>
            {(reward != null || symbol) && (
              <span>
                {action !== 'lp' && `${action} `}
                {reward?.value != null
                  ? reward.type === 'apr'
                    ? formatNumber(
                        action === 'supply' ? aprToApy(reward.value, 'llamalend.rewards') : reward.value,
                        'percent.rate',
                      )
                    : formatNumber(reward.value, 'multiplier')
                  : symbol}
              </span>
            )}
            {lock && <LockClosedIcon sx={{ fontSize: 'inherit' }} />}
          </Stack>
        }
      />
    </Tooltip>
  )
}
