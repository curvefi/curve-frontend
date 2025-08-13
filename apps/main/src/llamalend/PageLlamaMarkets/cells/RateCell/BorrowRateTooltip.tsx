import { ReactElement } from 'react'
import { LlamaMarket, MarketTypeMapping } from '@/llamalend/entities/llama-markets'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { MarketBorrowRateTooltipContent } from '@ui-kit/shared/ui/tooltips/MarketBorrowRateTooltipContent'
import { useFilteredRewards } from '@ui-kit/shared/ui/tooltips/utils'
import { useSnapshots } from '../../hooks/useSnapshots'

const rateType = 'borrow' as const

export const BorrowRateTooltip = ({ market, children }: { market: LlamaMarket; children: ReactElement }) => {
  const {
    rewards,
    type: marketType,
    rates: { borrow: borrowRate, borrowTotalApy },
    assets: {
      collateral: { rebasingYield, symbol: collateralSymbol },
    },
  } = market
  const { averageRate, period } = useSnapshots(market, rateType)
  const poolRewards = useFilteredRewards(rewards, MarketTypeMapping[marketType], rateType)

  return (
    <Tooltip
      clickable
      title={t`Borrow Rate`}
      body={
        <MarketBorrowRateTooltipContent
          marketType={MarketTypeMapping[marketType]}
          borrowRate={borrowRate}
          averageRate={averageRate}
          periodLabel={period}
          totalBorrowRate={borrowTotalApy}
          extraRewards={poolRewards}
          rebasingYield={rebasingYield}
          collateralSymbol={collateralSymbol}
        />
      }
      placement="top"
    >
      {children}
    </Tooltip>
  )
}
