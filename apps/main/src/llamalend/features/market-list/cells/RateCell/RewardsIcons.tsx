import lodash from 'lodash'
import { useFilteredRewards } from '@/llamalend/hooks/useFilteredRewards'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import Stack from '@mui/material/Stack'
import { RewardIcon } from '@ui-kit/shared/ui/RewardIcon'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { MarketRateType } from '@ui-kit/types/market'
import { useMarketExtraIncentives } from '../../hooks/useMarketExtraIncentives'

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
        data-testid="rewards-icons"
        sx={{
          minWidth: IconSize.md,
          '& svg, & img': { '&:not(:last-child)': { marginInline: '-8px' } },
        }}
      >
        {extraIncentives.map(({ title, address, blockchainId }) => (
          <TokenIcon key={title} blockchainId={blockchainId} address={address} size="mui-sm" />
        ))}
        {lodash.uniqBy(filteredRewards, 'platformImageId').map(({ platformImageId, platform }) => (
          <RewardIcon size="sm" key={platformImageId} src={platformImageId} alt={platform} />
        ))}
      </Stack>
    )
  )
}
