import { useSnapshots } from '@/llamalend/features/market-list/hooks/useSnapshots'
import { useFilteredRewards } from '@/llamalend/hooks/useFilteredRewards'
import { MarketNetBorrowAprTooltipContent } from '@/llamalend/widgets/tooltips/MarketNetBorrowAprTooltipContent'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { MarketRateType } from '@ui-kit/types/market'
import { useBorrowRateTooltipTitle } from '../../hooks/useBorrowRateTooltipTitle'
import { RateTooltipProps } from './RateCell'

export const BorrowRateTooltip = ({ market, children }: RateTooltipProps) => {
  const {
    averageRate: averageApr,
    period,
    averageTotalBorrowRate: totalAverageBorrowApr,
    isLoading,
  } = useSnapshots(market, MarketRateType.Borrow)
  const {
    rewards,
    type: marketType,
    rates: { borrowApr, borrowTotalApr: totalBorrowApr },
    assets: {
      collateral: { rebasingYieldApr, symbol: collateralSymbol },
    },
  } = market
  const poolRewards = useFilteredRewards(rewards, marketType, MarketRateType.Borrow)
  const title = useBorrowRateTooltipTitle({ totalBorrowApr, rebasingYieldApr, extraRewards: poolRewards })

  return (
    <Tooltip
      clickable
      title={title}
      body={
        <MarketNetBorrowAprTooltipContent
          marketType={marketType}
          borrowApr={borrowApr}
          averageApr={averageApr}
          totalBorrowApr={totalBorrowApr}
          totalAverageBorrowApr={totalAverageBorrowApr}
          extraRewards={poolRewards}
          rebasingYieldApr={rebasingYieldApr}
          periodLabel={period}
          collateralSymbol={collateralSymbol}
          isLoading={isLoading}
        />
      }
      placement="top"
    >
      {children}
    </Tooltip>
  )
}
