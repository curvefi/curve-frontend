import { sum } from 'lodash'
import type { StaticImageData } from 'next/image'
import { TooltipItem } from '@/llamalend/components/TooltipItem'
import type { PoolRewards } from '@/llamalend/entities/campaigns'
import { formatPercent } from '@/llamalend/PageLlamaMarkets/cells/cell.format'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { RewardIcon, RewardsImg } from '@ui-kit/shared/ui/RewardIcon'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'

export const RewardsTooltipItems = ({
  poolRewards,
  extraIncentives,
  title,
}: {
  title: string
  poolRewards: PoolRewards[]
  extraIncentives: { title: string; percentage: number; image: StaticImageData }[]
}) => {
  const percentage = extraIncentives.length > 0 && formatPercent(sum(extraIncentives.map(i => i.percentage)))
  return (
    <>
      {percentage && <TooltipItem title={title}>{percentage}</TooltipItem>}
      {extraIncentives?.map(({ percentage, title, image }, i) => (
        <TooltipItem key={i} subitem title={title}>
          <Stack direction="row">
            <RewardsImg src={image} alt={title} width={20} />
            {formatPercent(percentage)}
          </Stack>
        </TooltipItem>
      ))}
      {poolRewards.map((r, i) => (
        <TooltipItem subitem key={i} title={t`Points`}>
          <Stack
            component={Link}
            href={r.dashboardLink}
            target="_blank"
            sx={{
              textDecoration: 'none',
              color: t => t.design.Text.TextColors.Secondary,
              svg: { fontSize: 0, transition: `font-size ${TransitionFunction}` },
              '&:hover svg': { fontSize: 20 },
            }}
            direction="row"
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
