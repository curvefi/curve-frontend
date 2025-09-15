import lodash from 'lodash'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { useFilteredRewards } from '@/llamalend/hooks/useFilteredRewards'
import { useMarketExtraIncentives } from '@/llamalend/LlamaMarketsPage/hooks/useMarketExtraIncentives'
import { RewardIcon } from '@/llamalend/widgets/tooltips/RewardIcon'
import Stack from '@mui/material/Stack'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { MarketRateType } from '@ui-kit/types/market'

const { IconSize } = SizesAndSpaces

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
      <Stack
        direction="row"
        minWidth={IconSize.md}
        data-testid="rewards-icons"
        sx={{
          '& svg, & img': { '&:not(:last-child)': { marginInline: '-8px' } },
        }}
      >
        {extraIncentives.map(({ title, address, blockchainId }) => (
          <TokenIcon key={title} blockchainId={blockchainId} address={address} size="mui-sm" />
        ))}
        {lodash.uniq(filteredRewards.map((r) => r.platformImageId)).map((img) => (
          <RewardIcon size="sm" key={img} imageId={img} />
        ))}
      </Stack>
    )
  )
}
