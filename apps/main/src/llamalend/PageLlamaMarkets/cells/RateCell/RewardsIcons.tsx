import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { useFilteredRewards } from '@/llamalend/PageLlamaMarkets/cells/cell.format'
import type { RateType } from '@/llamalend/PageLlamaMarkets/hooks/useSnapshots'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import { RewardIcons } from '@ui-kit/shared/ui/RewardIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const RewardsIcons = ({
  market: { rewards, type: marketType },
  rateType,
}: {
  market: LlamaMarket
  rateType: RateType
}) => {
  const poolRewards = useFilteredRewards(rewards, marketType, rateType)
  if (!poolRewards.length) return null
  return (
    <Stack direction="row" gap={Spacing.xs} alignSelf="end">
      <Chip
        icon={<RewardIcons size="sm" rewards={poolRewards} />}
        size="small"
        color="highlight"
        label={poolRewards.map((r) => r.multiplier).join(', ')}
      />
    </Stack>
  )
}
