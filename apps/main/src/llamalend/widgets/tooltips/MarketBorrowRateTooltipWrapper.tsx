import { useSnapshots } from '@/llamalend/features/market-list/hooks/useSnapshots'
import { useFilteredRewards } from '@/llamalend/hooks/useFilteredRewards'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { MarketRateType } from '@ui-kit/types/market'
import { MarketNetBorrowAprTooltipContent } from './MarketNetBorrowAprTooltipContent'

type MarketBorrowRateTooltipWrapperProps = {
  market: LlamaMarket
}

export const MarketBorrowRateTooltipWrapper = ({ market }: MarketBorrowRateTooltipWrapperProps) => {
  const { averageRate, period, averageTotalBorrowRate, isLoading } = useSnapshots(market, MarketRateType.Borrow)
  const {
    rewards,
    type: marketType,
    rates: { borrowApr, borrowTotalApr: netBorrowApr },
    assets: {
      collateral: { rebasingYieldApr, symbol: collateralSymbol },
    },
  } = market
  const poolRewards = useFilteredRewards(rewards, marketType, MarketRateType.Borrow)

  return (
    <MarketNetBorrowAprTooltipContent
      marketType={marketType}
      borrowRate={borrowApr}
      averageRate={averageRate}
      periodLabel={period}
      totalBorrowRate={netBorrowApr}
      totalAverageBorrowRate={averageTotalBorrowRate}
      extraRewards={poolRewards}
      rebasingYield={rebasingYieldApr}
      collateralSymbol={collateralSymbol}
      isLoading={isLoading}
    />
  )
}
