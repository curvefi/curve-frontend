import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import { Stack } from '@mui/material'
import Link from '@mui/material/Link'
import { CampaignRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { TRANSITION_FUNCTION } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { ExtraIncentive } from '@ui-kit/types/market'
import { aprToApy, formatNumber } from '@ui-kit/utils'
import type { RewardsAction } from '@external-rewards'
import { TooltipItem } from './TooltipComponents'

const { Spacing } = SizesAndSpaces

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
              imageId={r.platformImageId}
            >
              <Stack
                component={Link}
                href={r.dashboardLink}
                target="_blank"
                direction="row"
                sx={{
                  alignItems: 'center',
                  gap: Spacing.xs,
                  textDecoration: 'none',
                  color: t => t.design.Text.TextColors.Secondary,
                  svg: { fontSize: 0, transition: `font-size ${TRANSITION_FUNCTION}` },
                  '&:hover svg': { fontSize: 20 },
                }}
              >
                {r.reward?.type === 'apr'
                  ? `${tooltipType === 'supply' ? '+' : ''}${formatNumber(tooltipType === 'supply' ? aprToApy(r.reward.value) : -r.reward.value, 'percent.rate')}`
                  : formatNumber(r.reward?.value, 'multiplier')}
                <ArrowOutwardIcon />
              </Stack>
            </TooltipItem>
          ),
      )}
    </>
  )
}
