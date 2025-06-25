import { useFilteredRewards } from '@/loan/components/PageLlamaMarkets/cells/cell.format'
import { TooltipItem } from '@/loan/components/PageLlamaMarkets/cells/RateCell/TooltipItem'
import { RateType } from '@/loan/components/PageLlamaMarkets/hooks/useSnapshots'
import { LlamaMarket } from '@/loan/entities/llama-markets'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { RewardIcon } from '@ui-kit/shared/ui/RewardIcon'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'

export const RewardsTooltipItems = ({
  market: { rewards, type: marketType },
  title,
  type,
}: {
  title: string
  market: LlamaMarket
  type: RateType
}) => {
  const poolRewards = useFilteredRewards(rewards, marketType, type)
  return (
    <>
      {poolRewards.length > 0 && <TooltipItem title={title} />}
      {poolRewards.map((r, i) => (
        <TooltipItem
          subitem
          key={i}
          title={
            <Stack direction="row" flexWrap="wrap">
              {t`Points`}
            </Stack>
          }
        >
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
