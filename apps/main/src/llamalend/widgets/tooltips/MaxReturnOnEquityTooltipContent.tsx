import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { formatNumber } from '@primitives/number.utils'
import { maybes } from '@primitives/objects.utils'
import { TooltipDescription, TooltipItem, TooltipItems, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export type MaxReturnOnEquity = {
  value: number | undefined
  leverage: number | null
  collateralApy: number | null
  borrowApy: number | null
}

export const MaxReturnOnEquityTooltipContent = ({
  market,
  leverage = market?.leverage,
  collateralApy = market?.assets.collateral.rebasingYield,
  borrowApy = market?.rates.borrowApy,
}: {
  market?: LlamaMarket
  leverage?: number | null
  collateralApy?: number | null
  borrowApy?: number | null
}) => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`The Maximum Return on Equity is an estimated annualized return on your own capital at maximum leverage, after borrowing costs.`}
    />
    <TooltipDescription text={t`Max RoE = M × C − (M − 1) × B`} />
    {maybes([leverage, collateralApy, borrowApy], (lev, colApy, borApy) => (
      <TooltipItems secondary>
        <TooltipItem title={t`Max multiplier (M)`}>{formatNumber(lev, 'multiplier')}</TooltipItem>
        <TooltipItem title={t`Collateral APY (C)`}>{formatNumber(colApy, 'percent.rate')}</TooltipItem>
        <TooltipItem title={t`Borrow APY (B)`}>{formatNumber(borApy, 'percent.rate')}</TooltipItem>
      </TooltipItems>
    ))}
  </TooltipWrapper>
)
