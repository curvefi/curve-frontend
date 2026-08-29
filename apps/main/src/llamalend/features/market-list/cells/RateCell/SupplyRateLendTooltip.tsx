import { useFilteredRewards } from '@/llamalend/hooks/useFilteredRewards'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { formatSupplyExtraIncentives, getCampaignAprs, getSupplyRateMetrics } from '@/llamalend/rates.utils'
import { MarketSupplyRateTooltipContent } from '@/llamalend/widgets/tooltips/MarketSupplyRateTooltipContent'
import { useAprToApy, useRateDisplay } from '@evm-ui/hooks/useAprToApy'
import { useSwitch } from '@evm-ui/hooks/useSwitch'
import { t } from '@evm-ui/lib/i18n'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { MarketRateType } from '@evm-ui/types/market'
import { AVERAGE_CATEGORIES } from '@evm-ui/utils'
import { useMarketRateHistory } from '../../hooks/useMarketRateHistory'
import { RateTooltipProps } from './RateCell'

const rateType = MarketRateType.Supply
const AVERAGE_CATEGORY = 'llamalend.marketList.rate'

const PERIOD_LABEL = AVERAGE_CATEGORIES[AVERAGE_CATEGORY].period
const LendRateTooltipContent = ({ market, isOpen }: { market: LlamaMarket; isOpen: boolean }) => {
  const convertRate = useAprToApy()
  const { minBoostedRateAverage, maxBoostedRateAverage, averageRate, isLoading } = useMarketRateHistory(
    market,
    { type: rateType, category: AVERAGE_CATEGORY },
    isOpen, // important: only call this when the tooltip is open
  ) // todo: `error` is ignored
  const {
    rates,
    rates: { lendApr, lendCrvAprUnboosted, lendCrvAprBoosted },
    assets: { borrowed },
    rewards,
    type: marketType,
  } = market

  const poolRewards = useFilteredRewards(rewards, marketType, rateType)
  const supplyMetrics = getSupplyRateMetrics({
    supplyApr: lendApr,
    crvBoostApr: [lendCrvAprUnboosted, lendCrvAprBoosted],
    rebasingYieldApr: borrowed?.rebasingYieldApr,
    extraIncentivesApr: rates.incentives.map(incentive => incentive.percentage),
    campaignsApr: getCampaignAprs(poolRewards),
    convertRate,
  })

  return (
    <MarketSupplyRateTooltipContent
      supplyRate={supplyMetrics.supplyRate}
      averageSupplyRate={averageRate}
      periodLabel={PERIOD_LABEL}
      extraRewards={poolRewards}
      extraIncentives={formatSupplyExtraIncentives({
        incentives: rates.incentives.map(incentive => ({
          ...incentive,
          percentage: convertRate(incentive.percentage),
        })),
        baseRate: convertRate(lendCrvAprUnboosted),
      })}
      totalRate={supplyMetrics.totalMinBoost}
      totalAverageRate={minBoostedRateAverage}
      boost={{
        type: 'market',
        rate: convertRate(lendCrvAprBoosted),
        totalRate: supplyMetrics.totalMaxBoost,
        totalAverageRate: maxBoostedRateAverage,
      }}
      rebasingYieldRate={supplyMetrics.rebasingYieldRate}
      isLoading={isLoading}
    />
  )
}

export const SupplyRateLendTooltip = ({ market, children }: RateTooltipProps) => {
  const rateDisplay = useRateDisplay()
  const [open, onOpen, onClose] = useSwitch(false)
  return (
    <Tooltip
      clickable
      title={rateDisplay === 'apy' ? t`Net Supply APY` : t`Net Supply APR`}
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
