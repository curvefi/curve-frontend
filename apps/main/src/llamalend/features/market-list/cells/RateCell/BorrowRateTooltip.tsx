import { useMarketRateHistory } from '@/llamalend/features/market-list/hooks/useMarketRateHistory'
import { useFilteredRewards } from '@/llamalend/hooks/useFilteredRewards'
import { MarketBorrowAprTooltipContent } from '@/llamalend/widgets/tooltips/MarketBorrowAprTooltipContent'
import { MarketRateType } from '@evm-ui/types/market'
import { AVERAGE_CATEGORIES, AverageCategory } from '@evm-ui/utils'
import { Tooltip } from '@ui/components/Tooltip'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'
import { RateTooltipProps } from './RateCell'

const RATE_CATEGORY: AverageCategory = 'llamalend.marketList.rate'

export const BorrowRateTooltip = ({ market, children }: RateTooltipProps) => {
  const [open, onOpen, onClose] = useSwitch(false)
  const { period } = AVERAGE_CATEGORIES[RATE_CATEGORY]
  const {
    averageRate: averageApr,
    averageTotalBorrowRate: totalAverageBorrowApr,
    isLoading,
  } = useMarketRateHistory(market, { type: MarketRateType.Borrow, category: RATE_CATEGORY }, open) // todo: `error` is ignored
  const {
    rewards,
    type: marketType,
    rates: { borrowApr, borrowTotalApr: totalBorrowApr },
    assets: {
      collateral: { rebasingYieldApr, symbol: collateralSymbol },
    },
  } = market
  const poolRewards = useFilteredRewards(rewards, marketType, MarketRateType.Borrow)

  return (
    <Tooltip
      clickable
      title={t`Borrow APR`}
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      body={
        <MarketBorrowAprTooltipContent
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
      mobileDrawer
    >
      {children}
    </Tooltip>
  )
}
