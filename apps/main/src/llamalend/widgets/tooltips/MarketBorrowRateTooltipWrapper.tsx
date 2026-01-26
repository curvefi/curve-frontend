import { useSnapshots } from '@/llamalend/features/market-list/hooks/useSnapshots'
import { useFilteredRewards } from '@/llamalend/hooks/useFilteredRewards'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { MarketRateType } from '@ui-kit/types/market'
import { MarketBorrowRateType } from './constants'
import { MarketBorrowAprTooltipContent } from './MarketBorrowAprTooltipContent'
import { MarketNetBorrowAprTooltipContent } from './MarketNetBorrowAprTooltipContent'

type MarketBorrowRateTooltipWrapperProps = {
  market: LlamaMarket
  borrowRateType: MarketBorrowRateType
}

export const MarketBorrowRateTooltipWrapper = ({ market, borrowRateType }: MarketBorrowRateTooltipWrapperProps) => {
  const { averageRate, period, averageTotalBorrowRate, isLoading } = useSnapshots(market, MarketRateType.Borrow)
  const {
    rewards,
    type: marketType,
    rates: { borrowApr, borrowTotalApr: netBorrowApr },
    assets: {
      collateral: { rebasingYield, symbol: collateralSymbol },
    },
  } = market
  const poolRewards = useFilteredRewards(rewards, marketType, MarketRateType.Borrow)

  return borrowRateType === 'netBorrowApr' ? (
    <MarketNetBorrowAprTooltipContent
      marketType={marketType}
      borrowRate={borrowApr}
      averageRate={averageRate}
      periodLabel={period}
      totalBorrowRate={netBorrowApr}
      totalAverageBorrowRate={averageTotalBorrowRate}
      extraRewards={poolRewards}
      rebasingYield={rebasingYield}
      collateralSymbol={collateralSymbol}
      isLoading={isLoading}
    />
  ) : (
    <MarketBorrowAprTooltipContent
      borrowRate={borrowApr}
      averageRate={averageRate}
      periodLabel={period}
      isLoading={isLoading}
    />
  )
}
