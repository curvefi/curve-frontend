import { useFilteredRewards } from '@/llamalend/hooks/useFilteredRewards'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { MarketSupplyRateTooltipContent } from '@/llamalend/widgets/tooltips/MarketSupplyRateTooltipContent'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { MarketRateType } from '@ui-kit/types/market'
import { useSnapshots } from '../../hooks/useSnapshots'
import { RateTooltipProps } from './RateCell'

const rateType = MarketRateType.Supply

const LendRateTooltipContent = ({ market, isOpen }: { market: LlamaMarket; isOpen: boolean }) => {
  const { averageRate, period, minBoostedAprAverage, maxBoostedAprAverage, isLoading } = useSnapshots(
    market,
    rateType,
    isOpen, // important: only call this when the tooltip is open
  ) // todo: `error` is ignored
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

export const SupplyRateLendTooltip = ({ market, children }: RateTooltipProps) => {
  const [open, onOpen, onClose] = useSwitch(false)
  return (
    <Tooltip
      clickable
      title={t`Supply Yield`}
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
