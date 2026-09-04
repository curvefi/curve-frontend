import { CampaignRewards } from '@evm-ui/entities/campaigns'
import { RewardIcon } from '@evm-ui/shared/ui/RewardIcon'
import type { ExtraIncentive } from '@evm-ui/types/market'
import { aprToApy, formatNumber } from '@evm-ui/utils'
import { TooltipItem, TooltipValueLink } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'
import type { RewardsAction } from '@external-rewards'

type RewardsTooltipItemsProps = {
  title: string
  boostedApr?: number | null | undefined
  extraRewards: CampaignRewards[]
  tooltipType: Extract<RewardsAction, 'borrow' | 'supply'>
  extraIncentives: ExtraIncentive[]
}

export const RewardsTooltipItems = ({
  title,
  extraRewards,
  extraIncentives,
  tooltipType,
}: RewardsTooltipItemsProps) => {
  const totalExtraPercentage =
    extraIncentives.length > 0
      ? formatNumber(
          extraIncentives.reduce((sum, item) => sum + (item.percentage || 0), 0),
          'percent.rate',
        )
      : undefined

  return (
    <>
      <TooltipItem title={title}>{totalExtraPercentage}</TooltipItem>
      {extraIncentives.map(({ percentage, title, address, blockchainId }, i) => (
        // eslint-disable-next-line @eslint-react/no-array-index-key -- Existing violation before enabling this rule.
        <TooltipItem key={i} variant="subItem" title={title} titleIcon={{ blockchainId, address, size: 'mui-sm' }}>
          {formatNumber(percentage, 'percent.rate')}
        </TooltipItem>
      ))}
      {extraRewards.map(
        (r, i) =>
          r.action === tooltipType && (
            <TooltipItem
              variant="subItem"
              // eslint-disable-next-line @eslint-react/no-array-index-key -- Existing violation before enabling this rule.
              key={i}
              title={r.reward?.type === 'apr' ? r.symbol || '' : t`Points`}
              titleAdornment={<RewardIcon size="md" src={r.platformImageId} alt={r.platform} />}
            >
              <TooltipValueLink href={r.dashboardLink}>
                {r.reward?.type === 'apr'
                  ? `${tooltipType === 'supply' ? '+' : ''}${formatNumber(tooltipType === 'supply' ? aprToApy(r.reward.value) : -r.reward.value, 'percent.rate')}`
                  : formatNumber(r.reward?.value, 'multiplier')}
              </TooltipValueLink>
            </TooltipItem>
          ),
      )}
    </>
  )
}
