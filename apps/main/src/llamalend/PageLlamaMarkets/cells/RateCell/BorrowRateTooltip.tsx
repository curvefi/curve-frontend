import { ReactElement } from 'react'
import { LlamaMarket, LlamaMarketType } from '@/llamalend/entities/llama-markets'
import { useMarketExtraIncentives } from '@/llamalend/hooks/useMarketExtraIncentives'
import { RewardsTooltipItems } from '@/llamalend/PageLlamaMarkets/cells/RateCell/RewardsTooltipItems'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { TooltipItem, TooltipItems, TooltipWrapper, TooltipDescription } from '@ui-kit/shared/ui/TooltipComponents'
import { useSnapshots } from '../../hooks/useSnapshots'
import { formatPercent, useFilteredRewards } from '../cell.format'

const messages = {
  [LlamaMarketType.Lend]: t`The borrow rate is the cost related to your borrow and varies according to the lend market, borrow incentives and its utilization.`,
  [LlamaMarketType.Mint]: t`The borrow rate is the cost related to your borrow and varies according to the mint market, borrow incentives and the crvUSD's peg.`,
}

const rateType = 'borrow' as const

const BorrowRateTooltipContent = ({ market }: { market: LlamaMarket }) => {
  const {
    chain,
    rewards,
    type: marketType,
    rates,
    rates: { borrow: borrowRate, borrowTotalApy },
    assets: {
      collateral: { rebasingYield, symbol: collateralSymbol },
    },
  } = market
  const { averageRate, period } = useSnapshots(market, rateType)
  const poolRewards = useFilteredRewards(rewards, marketType, rateType)
  const extraIncentives = useMarketExtraIncentives(rateType, chain, rates)

  return (
    <TooltipWrapper>
      <TooltipDescription text={messages[marketType]} />

      {!!rebasingYield && (
        <TooltipDescription text={t`The collateral of this market is yield bearing and offers extra yield`} />
      )}

      <Stack>
        <TooltipItems secondary>
          <TooltipItem title={t`Borrow fees`}>{formatPercent(borrowRate)}</TooltipItem>
        </TooltipItems>

        {(poolRewards.length > 0 || extraIncentives.length > 0) && (
          <TooltipItems secondary>
            <RewardsTooltipItems title={t`Borrowing incentives`} {...{ poolRewards, extraIncentives }} />
          </TooltipItems>
        )}

        {!!rebasingYield && (
          <TooltipItems secondary>
            <TooltipItem title={t`Yield bearing tokens`}>{formatPercent(rebasingYield)}</TooltipItem>
            <TooltipItem variant="subItem" title={collateralSymbol}>
              {formatPercent(rebasingYield)}
            </TooltipItem>
          </TooltipItems>
        )}

        <TooltipItems>
          <TooltipItem variant="primary" title={t`Total borrow rate`}>
            {formatPercent(borrowTotalApy)}
          </TooltipItem>
          <TooltipItem variant="subItem" loading={averageRate == null} title={`${period} ${t`Average`}`}>
            {formatPercent(averageRate)}
          </TooltipItem>
        </TooltipItems>
      </Stack>
    </TooltipWrapper>
  )
}

export const BorrowRateTooltip = ({ market, children }: { market: LlamaMarket; children: ReactElement }) => (
  <Tooltip clickable title={t`Borrow Rate`} body={<BorrowRateTooltipContent market={market} />} placement="top">
    {children}
  </Tooltip>
)
