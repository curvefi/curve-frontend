import { Equation } from '@/llamalend/features/market-position-details/PositionMetricTooltip'
import { getMaxPositionLeverage } from '@/llamalend/max-leverage.utils'
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
  const leverageShown = beta && market ? getMaxPositionLeverage(market) : leverage
  const collateralShown = beta ? (market?.assets.collateral.rebasingYieldApr ?? collateralApy) : collateralApy
  const borrowShown = beta ? (market?.rates.borrowApr ?? borrowApy) : borrowApy
  return (
    <TooltipWrapper>
      <TooltipDescription
        text={
          beta
            ? t`Max RoE estimates an APR on equity at the maximum leverage limit, assuming a zero-conversion start. It excludes swap costs and price movement. It is not a live position.`
            : t`The Maximum Return on Equity is an estimated annualized return on your own capital at maximum leverage, after borrowing costs.`
        }
      />
      {beta ? (
        <>
          <Equation>{t`RoE APR = maxLeverage × collateral APR − (maxLeverage − 1) × gross borrow APR`}</Equation>
          <TooltipDescription text={t`RoE = return on equity; APR = annual percentage rate.`} />
          <TooltipDescription text={t`maxLeverage = maximum position leverage.`} />
        </>
      ) : (
        <TooltipDescription text={t`Max RoE = M × C − (M − 1) × B`} />
      )}
      {maybes([leverageShown, collateralShown, borrowShown], (lev, collateralRate, borrowRate) => (
        <TooltipItems secondary>
          <TooltipItem title={beta ? t`Max leverage` : t`Max multiplier (M)`}>
            {formatNumber(lev, 'multiplier')}
          </TooltipItem>
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
