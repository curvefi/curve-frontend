import lodash from 'lodash'
import type { ReactElement } from 'react'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import { useMarketExtraIncentives } from '@ui-kit/hooks/useMarketExtraIncentives'
import { RewardIcon } from '@ui-kit/shared/ui/RewardIcon'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { useFilteredRewards } from '@ui-kit/shared/ui/tooltips/utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { MarketRateType } from '@ui-kit/types/market'

const { IconSize } = SizesAndSpaces

const RewardChip = ({ icon }: { icon: ReactElement }) => (
  <Chip
    icon={icon}
    size="small"
    color="highlight"
    sx={{
      borderRadius: '100%', // Make reward chips border round, regardless of theme
      '&:not(:last-child)': { marginInline: '-8px' },
    }}
  />
)

export const RewardsIcons = ({
  market: { rewards, type: marketType, rates },
  rateType,
}: {
  market: LlamaMarket
  rateType: MarketRateType
}) => {
  const filteredRewards = useFilteredRewards(rewards, marketType, rateType)
  const extraIncentives = useMarketExtraIncentives(rateType, rates.incentives, rates.lendCrvAprUnboosted)
  return (
    (filteredRewards.length > 0 || extraIncentives.length > 0) && (
      <Stack direction="row" minWidth={IconSize.md} data-testid="rewards-icons">
        {extraIncentives.map(({ title, address, blockchainId }) => (
          <RewardChip key={title} icon={<TokenIcon blockchainId={blockchainId} address={address} size="mui-sm" />} />
        ))}
        {lodash.uniq(filteredRewards.map((r) => r.platformImageId)).map((img) => (
          <RewardChip key={img} icon={<RewardIcon size="sm" key={img} imageId={img} />} />
        ))}
      </Stack>
    )
  )
}
