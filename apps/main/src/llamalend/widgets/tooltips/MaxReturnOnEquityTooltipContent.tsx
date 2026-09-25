import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
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
}) => {
  const beta = useNewLlamalendHealth()
  const collateralShown = beta ? market?.assets.collateral.rebasingYieldApr : collateralApy
  const borrowShown = beta ? market?.rates.borrowApr : borrowApy
  return (
  <TooltipWrapper>
    <TooltipDescription
      text={
        beta
          ? t`ROE at max leverage is the APR on equity 1 in a zero-conversion start: collateral equals the leverage limit, converted borrowed assets are 0, and debt is that limit minus 1. It excludes swap costs and price movement. It is not a live position.`
          : t`The Maximum Return on Equity is an estimated annualized return on your own capital at maximum leverage, after borrowing costs.`
      }
    />
    <TooltipDescription text={beta ? t`ROE APR = M × collateral APR − (M − 1) × gross borrow APR` : t`Max RoE = M × C − (M − 1) × B`} />
    {maybes([leverage, collateralShown, borrowShown], (lev, collateralRate, borrowRate) => (
      <TooltipItems secondary>
        <TooltipItem title={t`Max multiplier (M)`}>{formatNumber(lev, 'multiplier')}</TooltipItem>
        <TooltipItem title={beta ? t`Collateral APR` : t`Collateral APY (C)`}>
          {formatNumber(collateralRate, 'percent.rate')}
        </TooltipItem>
        <TooltipItem title={beta ? t`Gross borrow APR` : t`Borrow APY (B)`}>
          {formatNumber(borrowRate, 'percent.rate')}
        </TooltipItem>
      </TooltipItems>
    ))}
  </TooltipWrapper>
  )
}
