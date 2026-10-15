import { useFilteredRewards } from '@/llamalend/hooks/useFilteredRewards'
import { hasEstimatedNetBorrowApr, hasNetSupplyRate } from '@/llamalend/llama.utils'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { MarketRateType } from '@evm-ui/types/market'
import { useMarketExtraIncentives } from './useMarketExtraIncentives'

/** Whether the market has extras (yield, incentives or rewards) on top of its borrow APR or supply APY. */
export const useHasNetRate = ({ rewards, type, rates, assets }: LlamaMarket, rateType: MarketRateType) => {
  const extraRewards = useFilteredRewards(rewards, type, rateType)
  const extraIncentives = useMarketExtraIncentives(rateType, rates.incentives, rates.lendCrvAprUnboosted)
  return (
    {
      [MarketRateType.Borrow]: hasEstimatedNetBorrowApr({
        extraRewards,
        rebasingYieldApr: assets.collateral.rebasingYieldApr,
      }),
      [MarketRateType.Supply]: hasNetSupplyRate({
        extraRewards,
        extraIncentives,
        rebasingYieldApy: assets.borrowed.rebasingYield,
      }),
    } satisfies Record<MarketRateType, boolean>
  )[rateType]
}
