import lodash from 'lodash'
import { formatPercent } from '@/llamalend/format.utils'
import { RewardIcon } from '@/llamalend/widgets/tooltips/RewardIcon'
import { TooltipItem } from '@/llamalend/widgets/tooltips/TooltipComponents'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import type { CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const RewardsTooltipItems = ({
  poolRewards,
  extraIncentives,
  title,
}: {
  title: string
  poolRewards: CampaignPoolRewards[]
  extraIncentives: { title: string; percentage: number; address: string; blockchainId: string }[]
}) => {
  const percentage = extraIncentives.length > 0 && formatPercent(lodash.sum(extraIncentives.map((i) => i.percentage)))
  return (
    <>
      <TooltipItem title={title}>{percentage}</TooltipItem>
      {extraIncentives?.map(({ percentage, title, address, blockchainId }, i) => (
        <TooltipItem key={i} variant="subItem" title={title}>
          <Stack direction="row" gap={Spacing.xs} alignItems="center">
            <TokenIcon blockchainId={blockchainId} address={address} size="mui-sm" />
            {formatPercent(percentage)}
          </Stack>
        </TooltipItem>
      ))}
      {poolRewards.map((r, i) => (
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
          >
            <RewardIcon size="md" imageId={r.platformImageId} />
            {r.multiplier ? `${r.multiplier}x` : ''}
            <ArrowOutwardIcon />
          </Stack>
        </TooltipItem>
      ))}
    </>
  )
}
