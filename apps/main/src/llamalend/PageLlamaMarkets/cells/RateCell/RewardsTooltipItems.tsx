import { sum } from 'lodash'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { formatPercent, useFilteredRewards } from '@/llamalend/PageLlamaMarkets/cells/cell.format'
import { TooltipItem } from '@/llamalend/PageLlamaMarkets/cells/RateCell/TooltipItem'
import { RateType } from '@/llamalend/PageLlamaMarkets/hooks/useSnapshots'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { RCCrvLogoMD } from '@ui/images'
import { t } from '@ui-kit/lib/i18n'
import { RewardIcon, RewardsImg } from '@ui-kit/shared/ui/RewardIcon'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'

export const RewardsTooltipItems = ({
  market: { rewards, type: marketType },
  title,
  type,
  extraIncentives,
}: {
  title: string
  market: LlamaMarket
  type: RateType
  extraIncentives?: { title: string; percentage: number }[]
}) => {
  const poolRewards = useFilteredRewards(rewards, marketType, type)
  const percentage = extraIncentives?.length && formatPercent(sum(extraIncentives.map((i) => i.percentage)))
  const hasIncentives = Boolean(poolRewards.length || percentage)
  return (
    <>
      {hasIncentives && <TooltipItem title={title}>{percentage}</TooltipItem>}
      {extraIncentives?.map(({ percentage, title }, i) => (
        <TooltipItem key={i} subitem title={title}>
          <Stack direction="row">
            <RewardsImg src={RCCrvLogoMD} alt={t`CRV`} width={20} />
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
              color: (t) => t.design.Text.TextColors.Secondary,
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
