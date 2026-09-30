import { NET_SUPPLY_RATE_TITLE, TOTAL_SUPPLY_APY_TITLE } from '@/llamalend/constants'
import { useFilteredRewards } from '@/llamalend/hooks/useFilteredRewards'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { formatSupplyExtraIncentives } from '@/llamalend/rates.utils'
import { MarketSupplyRateTooltipContent } from '@/llamalend/widgets/tooltips/MarketSupplyRateTooltipContent'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import { MarketRateType } from '@evm-ui/types/market'
import { AVERAGE_CATEGORIES } from '@evm-ui/utils'
import { Tooltip } from '@ui/components/Tooltip'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'
import { aprToApy } from '@ui/lib/rates.utils'
import { useMarketRateHistory } from '../../hooks/useMarketRateHistory'
import { RateTooltipProps } from './RateCell'

const rateType = MarketRateType.Supply
const AVERAGE_CATEGORY = 'llamalend.marketList.rate'

const PERIOD_LABEL = AVERAGE_CATEGORIES[AVERAGE_CATEGORY].period
const LendRateTooltipContent = ({ market, isOpen }: { market: LlamaMarket; isOpen: boolean }) => {
  const { minBoostedAprAverage, maxBoostedAprAverage, averageRate, isLoading } = useMarketRateHistory(
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
          percentage: aprToApy(incentive.percentage, 'llamalend.rewards'),
        })),
        baseRate: aprToApy(lendCrvAprUnboosted, 'llamalend.rewards'),
      })}
      totalApy={lendTotalApyMinBoosted}
      totalAverageApy={minBoostedAprAverage}
      boost={{
        type: 'market',
        apy: aprToApy(lendCrvAprBoosted, 'llamalend.rewards'),
        totalApy: lendTotalApyMaxBoosted,
        totalAverageApy: maxBoostedAprAverage,
      }}
      rebasingYieldApy={borrowed?.rebasingYield}
      isLoading={isLoading}
    />
  )
}

export const SupplyRateLendTooltip = ({ market, children, showBaseSupplyApy }: RateTooltipProps) => {
  const beta = useNewLlamalendHealth()
  const [open, onOpen, onClose] = useSwitch(false)
  return (
    <Tooltip
      clickable
      title={beta ? (showBaseSupplyApy ? t`Supply APY` : TOTAL_SUPPLY_APY_TITLE) : NET_SUPPLY_RATE_TITLE}
      body={<LendRateTooltipContent isOpen={open} market={market} />}
      placement="top"
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      mobileDrawer
    >
      {children}
    </Tooltip>
  )
}
