import uniq from 'lodash/uniq'
import type { ReactElement } from 'react'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { useMarketExtraIncentives } from '@/llamalend/hooks/useMarketExtraIncentives'
import { useFilteredRewards } from '@/llamalend/PageLlamaMarkets/cells/cell.format'
import type { RateType } from '@/llamalend/PageLlamaMarkets/hooks/useSnapshots'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import { RewardIcon, RewardsImg } from '@ui-kit/shared/ui/RewardIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { IconSize } = SizesAndSpaces

const RewardChip = ({ icon }: { icon: ReactElement }) => (
  <Chip icon={icon} size="small" color="highlight" sx={{ '&:not(:last-child)': { marginInline: '-8px' } }} />
)

export const RewardsIcons = ({
  market: { rewards, type: marketType, rates },
  rateType,
}: {
  market: LlamaMarket
  rateType: RateType
}) => {
  const filteredRewards = useFilteredRewards(rewards, marketType, rateType)
  const extraIncentives = useMarketExtraIncentives(rateType, rates)
  return (
    (filteredRewards.length > 0 || extraIncentives.length > 0) && (
      <Stack direction="row" alignSelf="end" minWidth={IconSize.md} data-testid="rewards-icons">
        {extraIncentives.map(({ title, image }) => (
          <RewardChip key={title} icon={<RewardsImg src={image} alt={title} />} />
        ))}
        {uniq(filteredRewards.map((r) => r.platformImageId)).map((img) => (
          <RewardChip key={img} icon={<RewardIcon size="sm" key={img} imageId={img} />} />
        ))}
      </Stack>
    )
  )
}
