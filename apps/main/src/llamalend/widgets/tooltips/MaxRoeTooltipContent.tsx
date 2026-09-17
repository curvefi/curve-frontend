import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { formatNumber } from '@primitives/number.utils'
import { TooltipDescription, TooltipItem, TooltipItems, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const MaxRoeTooltipContent = ({ market }: { market?: LlamaMarket }) => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`The Maximum Return on Equity is an estimated annualized return on your own capital at maximum leverage, after borrowing costs.`}
    />
    <TooltipDescription text={t`Max RoE = M × C − (M − 1) × B`} />
    <TooltipItems secondary>
      <TooltipItem title={t`Max multiplier (M)`}>
        {market && formatNumber(market.leverage, { unit: 'multiplier', abbreviate: false, fallback: '-' })}
      </TooltipItem>
      <TooltipItem title={t`Collateral APY (C)`}>
        {market && formatNumber(market.assets.collateral.rebasingYield, 'percent.rate')}
      </TooltipItem>
      <TooltipItem title={t`Borrow APY (B)`}>
        {market && formatNumber(market.rates.borrowApy, 'percent.rate')}
      </TooltipItem>
    </TooltipItems>
  </TooltipWrapper>
)
