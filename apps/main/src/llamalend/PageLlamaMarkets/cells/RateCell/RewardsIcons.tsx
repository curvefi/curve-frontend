import lodash from 'lodash'
import type { ReactElement } from 'react'
import { LlamaMarket, MarketTypeMapping } from '@/llamalend/entities/llama-markets'
import type { RateType } from '@/llamalend/PageLlamaMarkets/hooks/useSnapshots'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import { useMarketExtraIncentives } from '@ui-kit/hooks/useMarketExtraIncentives'
import { RewardIcon } from '@ui-kit/shared/ui/RewardIcon'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { useFilteredRewards } from '@ui-kit/shared/ui/tooltips/utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

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
  market: { chain, rewards, type: marketType, rates },
  rateType,
}: {
  market: LlamaMarket
  rateType: RateType
}) => {
  const filteredRewards = useFilteredRewards(
    rewards,
    MarketTypeMapping[marketType],
    rateType === 'lend' ? 'supply' : 'borrow',
  )
  const extraIncentives = useMarketExtraIncentives(
    rateType === 'lend' ? 'supply' : 'borrow',
    rates.incentives,
    rates.lendCrvAprUnboosted,
  )
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
