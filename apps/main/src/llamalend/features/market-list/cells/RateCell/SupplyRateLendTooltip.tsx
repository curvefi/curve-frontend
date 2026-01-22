import { useFilteredRewards } from '@/llamalend/hooks/useFilteredRewards'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { MarketSupplyRateTooltipContent } from '@/llamalend/widgets/tooltips/MarketSupplyRateTooltipContent'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip, TooltipProps } from '@ui-kit/shared/ui/Tooltip'
import { MarketRateType } from '@ui-kit/types/market'
import { useSnapshots } from '../../hooks/useSnapshots'

const rateType = MarketRateType.Supply

const LendRateTooltipContent = ({ market }: { market: LlamaMarket }) => {
  const { averageRate, period, minBoostedAprAverage, maxBoostedAprAverage, isLoading } = useSnapshots(market, rateType) // important: only call this one tooltip is open!
  const {
    rates,
    rates: { lendTotalApyMinBoosted, lendApr, lendCrvAprUnboosted, lendCrvAprBoosted, lendTotalApyMaxBoosted },
    assets: { borrowed },
    rewards,
    type: marketType,
  } = market

  const poolRewards = useFilteredRewards(rewards, marketType, rateType)

  return (
    <MarketSupplyRateTooltipContent
      supplyRate={lendApr}
      averageRate={averageRate}
      periodLabel={period}
      extraRewards={poolRewards}
      extraIncentives={rates.incentives}
      minBoostApr={lendCrvAprUnboosted}
      maxBoostApr={lendCrvAprBoosted}
      totalSupplyRateMinBoost={lendTotalApyMinBoosted}
      totalSupplyRateMaxBoost={lendTotalApyMaxBoosted}
      totalAverageSupplyRateMinBoost={minBoostedAprAverage}
      totalAverageSupplyRateMaxBoost={maxBoostedAprAverage}
      rebasingYield={borrowed?.rebasingYield}
      isLoading={isLoading}
    />
  )
}

type SupplyRateTooltipProps = Pick<TooltipProps, 'children'> & {
  market: LlamaMarket
}

export const SupplyRateLendTooltip = ({ market, children }: SupplyRateTooltipProps) => (
  <Tooltip clickable title={t`Supply Yield`} body={<LendRateTooltipContent market={market} />} placement="top">
    {children}
  </Tooltip>
)
