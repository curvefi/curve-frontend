import { useFilteredRewards } from '@/llamalend/hooks/useFilteredRewards'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { aprToApy } from '@/llamalend/rates.utils'
import { MarketSupplyRateTooltipContent } from '@/llamalend/widgets/tooltips/MarketSupplyRateTooltipContent'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { MarketRateType } from '@ui-kit/types/market'
import { AVERAGE_CATEGORIES } from '@ui-kit/utils'
import { useSnapshots } from '../../hooks/useSnapshots'
import { RateTooltipProps } from './RateCell'

const rateType = MarketRateType.Supply
const averageCategory = 'llamalend.marketList.rate'

const LendRateTooltipContent = ({ market, isOpen }: { market: LlamaMarket; isOpen: boolean }) => {
  const { minBoostedAprAverage, maxBoostedAprAverage, averageRate, isLoading } = useSnapshots(
    market,
    { type: rateType, category: averageCategory },
    isOpen, // important: only call this when the tooltip is open
  ) // todo: `error` is ignored
  const {
    rates,
    rates: { lendTotalApyMinBoosted, lendApy, lendCrvAprUnboosted, lendCrvAprBoosted, lendTotalApyMaxBoosted },
    assets: { borrowed },
    rewards,
    type: marketType,
  } = market

  const poolRewards = useFilteredRewards(rewards, marketType, rateType)

  return (
    <MarketSupplyRateTooltipContent
      supplyApy={lendApy}
      averageSupplyApy={averageRate}
      periodLabel={AVERAGE_CATEGORIES[averageCategory].period}
      extraRewards={poolRewards}
      extraIncentives={rates.incentives.map((incentive) => ({
        ...incentive,
        percentage: aprToApy(incentive.percentage) as number,
      }))}
      minBoostApy={aprToApy(lendCrvAprUnboosted)}
      maxBoostApy={aprToApy(lendCrvAprBoosted)}
      totalApy={lendTotalApyMinBoosted}
      totalMaxBoostApy={lendTotalApyMaxBoosted}
      totalAverageApy={minBoostedAprAverage}
      totalAverageMaxBoostApy={maxBoostedAprAverage}
      rebasingYieldApy={borrowed?.rebasingYield}
      isLoading={isLoading}
    />
  )
}

export const SupplyRateLendTooltip = ({ market, children }: RateTooltipProps) => {
  const [open, onOpen, onClose] = useSwitch(false)
  return (
    <Tooltip
      clickable
      title={t`Net supply rate`}
      body={<LendRateTooltipContent isOpen={open} market={market} />}
      placement="top"
      open={open}
      onOpen={onOpen}
      onClose={onClose}
    >
      {children}
    </Tooltip>
  )
}
