import { ReactElement } from 'react'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { MarketSupplyRateTooltipContent } from '@ui-kit/shared/ui/tooltips/MarketSupplyRateTooltipContent'
import { useFilteredRewards } from '@ui-kit/shared/ui/tooltips/utils'
import { useSnapshots } from '../../hooks/useSnapshots'

const rateType = 'lend' as const
const marketRateType = 'supply' as const

export const LendRateTooltip = ({ market, children }: { market: LlamaMarket; children: ReactElement }) => {
  const { averageRate, period } = useSnapshots(market, rateType)
  const {
    rates,
    rates: { lend, lendApr, lendCrvAprUnboosted, lendCrvAprBoosted, lendTotalApyMaxBoosted },
    assets: { borrowed },
    rewards,
    type: marketType,
  } = market

  const poolRewards = useFilteredRewards(rewards, marketType === 'Mint' ? 'mint' : 'lend', marketRateType)

  return (
    <Tooltip
      clickable
      title={t`Supply Yield`}
      body={
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
      }
      placement="top"
    >
      {children}
    </Tooltip>
  )
}
