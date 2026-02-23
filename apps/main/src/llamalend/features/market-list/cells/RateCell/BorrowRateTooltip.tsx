import { useSnapshots } from '@/llamalend/features/market-list/hooks/useSnapshots'
import { useFilteredRewards } from '@/llamalend/hooks/useFilteredRewards'
import { getBorrowRateTooltipTitle } from '@/llamalend/llama.utils'
import { MarketNetBorrowAprTooltipContent } from '@/llamalend/widgets/tooltips/MarketNetBorrowAprTooltipContent'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { MarketRateType } from '@ui-kit/types/market'
import { RateTooltipProps } from './RateCell'

export const BorrowRateTooltip = ({ market, children }: RateTooltipProps) => {
  const [open, onOpen, onClose] = useSwitch(false)
  const {
    averageRate: averageApr,
    period,
    averageTotalBorrowRate: totalAverageBorrowApr,
    isLoading,
  } = useSnapshots(market, MarketRateType.Borrow, open)
  const {
    rewards,
    type: marketType,
    rates: { borrowApr, borrowTotalApr: totalBorrowApr },
    assets: {
      collateral: { rebasingYieldApr, symbol: collateralSymbol },
    },
  } = market
  const poolRewards = useFilteredRewards(rewards, marketType, MarketRateType.Borrow)
  const title = getBorrowRateTooltipTitle({ totalBorrowApr, rebasingYieldApr, extraRewards: poolRewards })

  return (
    <Tooltip
      clickable
      title={title}
      open={open}
      onOpen={onOpen}
      onClose={onClose}
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
