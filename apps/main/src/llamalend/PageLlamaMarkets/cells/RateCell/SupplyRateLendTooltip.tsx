import { ReactElement } from 'react'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { MarketSupplyRateTooltipContent } from '@ui-kit/shared/ui/tooltips/MarketSupplyRateTooltipContent'
import { useFilteredRewards } from '@ui-kit/shared/ui/tooltips/utils'
import { MarketRateType } from '@ui-kit/types/market'
import { useSnapshots } from '../../hooks/useSnapshots'

const rateType = MarketRateType.Supply

const LendRateTooltipContent = ({ market }: { market: LlamaMarket }) => {
  const { averageRate, period } = useSnapshots(market, rateType) // important: only call this one tooltip is open!
  const {
    rates,
    rates: { lend, lendApr, lendCrvAprUnboosted, lendCrvAprBoosted, lendTotalApyMaxBoosted },
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
      totalSupplyRateMinBoost={lend}
      totalSupplyRateMaxBoost={lendTotalApyMaxBoosted}
      rebasingYield={borrowed?.rebasingYield}
      isLoading={averageRate == null}
    />
  )
}

export const SupplyRateLendTooltip = ({ market, children }: { market: LlamaMarket; children: ReactElement }) => (
  <Tooltip clickable title={t`Supply Yield`} body={<LendRateTooltipContent market={market} />} placement="top">
    {children}
  </Tooltip>
)
