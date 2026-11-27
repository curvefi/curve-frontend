import lodash from 'lodash'
import { useFilteredRewards } from '@/llamalend/hooks/useFilteredRewards'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { MarketRateType } from '@evm-ui/types/market'
import { MAINNET_CRV_ADDRESS } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import { RewardIcon } from '@ui/components/RewardIcon'
import { TokenIcon } from '@ui/components/TokenIcon'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useMarketExtraIncentives } from '../../hooks/useMarketExtraIncentives'

const { IconSize } = SizesAndSpaces

export const RewardsIcons = ({
  market: { rewards, type: marketType, rates, collateralYields },
  rateType,
}: {
  market: LlamaMarket
  rateType: MarketRateType
}) => {
  const filteredRewards = useFilteredRewards(rewards, marketType, rateType)
  const extraIncentives = useMarketExtraIncentives(rateType, rates.incentives, rates.lendCrvAprUnboosted)
  const showCollateralCrv = rateType === MarketRateType.Borrow && collateralYields.crvApr != null
  return (
    (filteredRewards.length > 0 || extraIncentives.length > 0 || showCollateralCrv) && (
      <Stack
        direction="row"
        data-testid="rewards-icons"
        sx={{ minWidth: IconSize.md, '& svg, & img': { '&:not(:last-child)': { marginInline: '-8px' } } }}
      >
        {showCollateralCrv && (
          <TokenIcon blockchainId="ethereum" token={{ address: MAINNET_CRV_ADDRESS }} size="mui-sm" />
        )}
        {extraIncentives.map(({ title, address, blockchainId }) => (
          <TokenIcon key={title} blockchainId={blockchainId} token={{ address }} size="mui-sm" />
        ))}
        {lodash.uniqBy(filteredRewards, 'platformImageId').map(({ platformImageId, platform }) => (
          <RewardIcon size="sm" key={platformImageId} src={platformImageId} alt={platform} />
        ))}
      </Stack>
    )
  )
}
