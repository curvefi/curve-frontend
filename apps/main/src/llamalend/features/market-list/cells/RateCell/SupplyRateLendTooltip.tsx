import { NET_SUPPLY_RATE_TITLE } from '@/llamalend/constants'
import { useFilteredRewards } from '@/llamalend/hooks/useFilteredRewards'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { aprToApy, formatSupplyExtraIncentives } from '@/llamalend/rates.utils'
import { MarketSupplyRateTooltipContent } from '@/llamalend/widgets/tooltips/MarketSupplyRateTooltipContent'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { MarketRateType } from '@ui-kit/types/market'
import { AVERAGE_CATEGORIES } from '@ui-kit/utils'
import { useMarketSnapshots } from '../../hooks/useMarketSnapshots'
import { RateTooltipProps } from './RateCell'

const rateType = MarketRateType.Supply
const AVERAGE_CATEGORY = 'llamalend.marketList.rate'

const PERIOD_LABEL = AVERAGE_CATEGORIES[AVERAGE_CATEGORY].period
const LendRateTooltipContent = ({ market, isOpen }: { market: LlamaMarket; isOpen: boolean }) => {
  const { minBoostedAprAverage, maxBoostedAprAverage, averageRate, isLoading } = useMarketSnapshots(
    market,
    { type: rateType, category: AVERAGE_CATEGORY },
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
      periodLabel={PERIOD_LABEL}
      extraRewards={poolRewards}
      extraIncentives={formatSupplyExtraIncentives({
        incentives: rates.incentives.map(incentive => ({
          ...incentive,
          percentage: aprToApy(incentive.percentage)!,
        })),
        baseRate: aprToApy(lendCrvAprUnboosted),
      })}
      totalApy={lendTotalApyMinBoosted}
      totalAverageApy={minBoostedAprAverage}
      boost={{
        type: 'market',
        apy: aprToApy(lendCrvAprBoosted),
        totalApy: lendTotalApyMaxBoosted,
        totalAverageApy: maxBoostedAprAverage,
      }}
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
      title={NET_SUPPLY_RATE_TITLE}
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
