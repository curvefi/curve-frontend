import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { useSnapshots } from '@/llamalend/features/market-list/hooks/useSnapshots'
import { useFilteredRewards } from '@/llamalend/hooks/useFilteredRewards'
import { MarketRateType } from '@ui-kit/types/market'
import { MarketBorrowRateTooltipContent } from './MarketBorrowRateTooltipContent'

type MarketBorrowRateTooltipWrapperProps = {
  market: LlamaMarket
}

export const MarketBorrowRateTooltipWrapper = ({ market }: MarketBorrowRateTooltipWrapperProps) => {
  const { averageRate, period, averageTotalBorrowRate, isLoading } = useSnapshots(market, MarketRateType.Borrow)
  const {
    rewards,
    type: marketType,
    rates: { borrowApy: borrowRate, borrowTotalApy, borrowFutureRate },
    assets: {
      collateral: { rebasingYield, symbol: collateralSymbol },
    },
  } = market
  const poolRewards = useFilteredRewards(rewards, marketType, MarketRateType.Borrow)

  return (
    <MarketBorrowRateTooltipContent
      marketType={marketType}
      borrowRate={borrowRate}
      borrowFutureRate={borrowFutureRate}
      averageRate={averageRate}
      periodLabel={period}
      totalBorrowRate={borrowTotalApy}
      totalAverageBorrowRate={averageTotalBorrowRate}
      extraRewards={poolRewards}
      rebasingYield={rebasingYield}
      collateralSymbol={collateralSymbol}
      isLoading={isLoading}
    />
  )
}
