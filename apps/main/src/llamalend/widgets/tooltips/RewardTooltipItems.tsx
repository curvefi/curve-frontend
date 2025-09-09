import { formatPercent } from '@/llamalend/utils'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import { Stack } from '@mui/material'
import Link from '@mui/material/Link'
import { PoolRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { RewardIcon } from '@ui-kit/shared/ui/RewardIcon'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TooltipItem } from './TooltipComponents'

const { Spacing } = SizesAndSpaces

export type ExtraIncentiveItem = {
  title: string
  percentage: number
  address: string
  blockchainId: string
}

type RewardsTooltipItemsProps = {
  title: string
  boostedApr?: number | null | undefined
  extraRewards: PoolRewards[]
  extraIncentives: ExtraIncentiveItem[]
}

export const RewardsTooltipItems = ({ title, extraRewards, extraIncentives }: RewardsTooltipItemsProps) => {
  const totalExtraPercentage =
    extraIncentives.length > 0
      ? formatPercent(extraIncentives.reduce((sum, item) => sum + (item.percentage || 0), 0))
      : undefined

  return (
    <>
      <TooltipItem title={title}>{totalExtraPercentage}</TooltipItem>
      {extraIncentives.map(({ percentage, title, address, blockchainId }, i) => (
        <TooltipItem key={i} variant="subItem" title={title}>
          <Stack direction="row" gap={Spacing.xs} alignItems="center">
            <TokenIcon blockchainId={blockchainId} address={address} size="mui-sm" />
            {formatPercent(percentage)}
          </Stack>
        </TooltipItem>
      ))}
      {extraRewards.map((r, i) => (
        <TooltipItem variant="subItem" key={i} title={t`Points`}>
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
            <RewardIcon size="md" imageId={r.platformImageId} />
            {r.multiplier}
            <ArrowOutwardIcon />
          </Stack>
        </TooltipItem>
      ))}
    </>
  )
}
