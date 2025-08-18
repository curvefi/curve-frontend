import { ReactElement } from 'react'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { MarketBorrowRateTooltipContent } from '@ui-kit/shared/ui/tooltips/MarketBorrowRateTooltipContent'
import { useFilteredRewards } from '@ui-kit/shared/ui/tooltips/utils'
import { MarketRateType } from '@ui-kit/types/market'
import { useSnapshots } from '../../hooks/useSnapshots'

const rateType = MarketRateType.Borrow

const BorrowRateTooltipContent = ({ market }: { market: LlamaMarket }) => {
  const { averageRate, period } = useSnapshots(market, rateType) // important: only call this one tooltip is open!
  const {
    rewards,
    type: marketType,
    rates: { borrow: borrowRate, borrowTotalApy },
    assets: {
      collateral: { rebasingYield, symbol: collateralSymbol },
    },
  } = market
  const poolRewards = useFilteredRewards(rewards, marketType, rateType)
  return (
    <MarketBorrowRateTooltipContent
      marketType={marketType}
      borrowRate={borrowRate}
      averageRate={averageRate}
      periodLabel={period}
      totalBorrowRate={borrowTotalApy}
      extraRewards={poolRewards}
      rebasingYield={rebasingYield}
      collateralSymbol={collateralSymbol}
    />
  )
}

export const BorrowRateTooltip = ({ market, children }: { market: LlamaMarket; children: ReactElement }) => (
  <Tooltip clickable title={t`Borrow Rate`} body={<BorrowRateTooltipContent market={market} />} placement="top">
    {children}
  </Tooltip>
)
