import { formatPercent } from '@/llamalend/format.utils'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import { Stack } from '@mui/material'
import Link from '@mui/material/Link'
import { CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { RewardsAction } from '@external-rewards'
import { TooltipItem } from './TooltipComponents'

const { Spacing } = SizesAndSpaces

export type ExtraIncentiveItem = {
  title: string
  percentage: number
  address: string
  blockchainId: string
  isBoost: boolean
}

type RewardsTooltipItemsProps = {
  title: string
  boostedApr?: number | null | undefined
  extraRewards: CampaignPoolRewards[]
  tooltipType: Extract<RewardsAction, 'borrow' | 'supply'>
  extraIncentives: ExtraIncentiveItem[]
}

export const RewardsTooltipItems = ({
  title,
  extraRewards,
  extraIncentives,
  tooltipType,
}: RewardsTooltipItemsProps) => {
  const totalExtraPercentage =
    extraIncentives.length > 0
      ? formatPercent(extraIncentives.reduce((sum, item) => sum + (item.percentage || 0), 0))
      : undefined

  return (
    <>
      <TooltipItem title={title}>{totalExtraPercentage}</TooltipItem>
      {extraIncentives.map(({ percentage, title, address, blockchainId, isBoost }, i) => (
        <TooltipItem key={i} variant="subItem" title={title} titleIcon={{ blockchainId, address, size: 'mui-sm' }}>
          {`${isBoost ? '+' : ''}${formatPercent(percentage)}`}
        </TooltipItem>
      ))}
      {extraRewards.map(
        (r, i) =>
          r.action === tooltipType && (
            <TooltipItem variant="subItem" key={i} title={t`Points`} imageId={r.platformImageId}>
              <Stack
                component={Link}
                href={r.dashboardLink}
                target="_blank"
                sx={{
                  textDecoration: 'none',
                  color: (t) => t.design.Text.TextColors.Secondary,
                  svg: { fontSize: 0, transition: `font-size ${TransitionFunction}` },
                  '&:hover svg': { fontSize: 20 },
                }}
                direction="row"
                alignItems="center"
                gap={Spacing.xs}
              >
                {r.multiplier ? `${r.multiplier}x` : ''}
                <ArrowOutwardIcon />
              </Stack>
            </TooltipItem>
          ),
      )}
    </>
  )
}
