import { useSnapshots } from '@/llamalend/features/market-list/hooks/useSnapshots'
import { useFilteredRewards } from '@/llamalend/hooks/useFilteredRewards'
import { MarketNetBorrowAprTooltipContent } from '@/llamalend/widgets/tooltips/MarketNetBorrowAprTooltipContent'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { MarketRateType } from '@ui-kit/types/market'
import { RateTooltipProps } from './RateCell'

export const BorrowRateTooltip = ({ market, children }: RateTooltipProps) => {
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
    <Tooltip
      clickable
      title={t`Net borrow APR`}
      body={
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
      }
      placement="top"
    >
      {children}
    </Tooltip>
  )
}
