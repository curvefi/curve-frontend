import { ReactElement } from 'react'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { MarketBorrowRateTooltip } from '@ui-kit/shared/ui/tooltips/MarketBorrowRateTooltip'
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
  const poolRewards = useFilteredRewards(rewards, marketType === 'Mint' ? 'mint' : 'lend', rateType)

  return (
    <Tooltip
      clickable
      title={t`Borrow Rate`}
      body={
        <MarketBorrowRateTooltip
          marketType={marketType === 'Mint' ? 'mint' : 'lend'}
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
