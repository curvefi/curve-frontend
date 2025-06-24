import { useFilteredRewards } from '@/loan/components/PageLlamaMarkets/cells/cell.format'
import { getRewardsDescription } from '@/loan/components/PageLlamaMarkets/cells/MarketTitleCell/cell.utils'
import { TooltipItem } from '@/loan/components/PageLlamaMarkets/cells/RateCell/TooltipItem'
import { RateType } from '@/loan/components/PageLlamaMarkets/hooks/useSnapshots'
import { LlamaMarket } from '@/loan/entities/llama-markets'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { RewardIcon } from '@ui-kit/shared/ui/RewardIcon'

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
      {rewards.map((r, i) => (
        <TooltipItem
          subitem
          key={i}
          title={
            <Stack direction="row" flexWrap="wrap">
              {getRewardsDescription(r)}
              {r.dashboardLink && (
                <Button
                  component={Link}
                  color="ghost"
                  variant="inline"
                  href={r.dashboardLink}
                  target="_blank"
                  endIcon={<ArrowOutwardIcon />}
                >{t`Go to issuer`}</Button>
              )}
            </Stack>
          }
        >
          <Stack direction="row">
            {r.multiplier}
            <RewardIcon size="md" imageId={r.platformImageId} />
          </Stack>
        </TooltipItem>
      ))}
    </>
  )
}
