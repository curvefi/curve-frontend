import type { PositionPnlQueries } from '@/llamalend/hooks/usePositionPnl'
import { tokenMetric } from '@/llamalend/llama.utils'
import type { PositionPnl } from '@/llamalend/position-pnl.utils'
import { EquityTooltipContent } from '@/llamalend/widgets/tooltips/EquityTooltipContent'
import { PnlTooltipContent } from '@/llamalend/widgets/tooltips/PnlTooltipContent'
import type { Amount } from '@primitives/decimal.utils'
import { formatNumber, type NumberFormatCategory } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import { Metric } from '@ui/components/Metric'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { UNAVAILABLE_TOKEN_SYMBOL } from '@ui/lib/tokens'
import { BORROW_METRIC_CATEGORY, BORROW_METRIC_TOOLTIP } from './market-position-details.utils'

const formatSigned = (value: Amount, category: NumberFormatCategory) =>
  `${Number(value) > 0 ? '+' : ''}${formatNumber(value, category)}`

const formatDebtPnl = ({ pnl, roe }: PositionPnl['debt'], symbol: string) => {
  const amount = `${formatSigned(pnl, 'token.amount')} ${symbol}`
  const roePercent = maybe(roe, roe => ` (${formatSigned(roe, 'percent.value')})`) ?? ''
  return t`In ${symbol}: ${amount}${roePercent}`
}

type PnlMetricsProps = PositionPnlQueries & {
  borrowSymbol: string | undefined
  collateralSymbol: string | undefined
  borrowUsdRate: QueryProp<Amount>
  collateralUsdRate: QueryProp<Amount>
}

/** Equity in the borrowed token and PNL (ROE %) in the collateral token, each with its USD value */
export const PnlMetrics = ({
  equity,
  pnl,
  borrowSymbol,
  collateralSymbol,
  borrowUsdRate,
  collateralUsdRate,
}: PnlMetricsProps) => {
  const pnlMetric = tokenMetric({
    value: mapQuery(pnl, pnl => pnl?.collateral?.pnl ?? null),
    symbol: collateralSymbol,
    usdRate: collateralUsdRate,
  })
  return (
    <>
      <Metric
        category={BORROW_METRIC_CATEGORY}
        label={t`Equity`}
        labelTooltip={{ title: t`Equity`, body: <EquityTooltipContent />, ...BORROW_METRIC_TOOLTIP }}
        {...tokenMetric({ value: equity, symbol: borrowSymbol, usdRate: borrowUsdRate })}
      />
      <Metric
        category={BORROW_METRIC_CATEGORY}
        label={t`PNL (ROE %)`}
        labelTooltip={{ title: t`PNL (ROE %)`, body: <PnlTooltipContent />, ...BORROW_METRIC_TOOLTIP }}
        {...pnlMetric}
        valueOptions={{ ...pnlMetric.valueOptions, fallback: '-' }}
        change={maybe(pnl.data?.collateral?.roe, Number)}
        valueTooltip={maybe(pnl.data?.debt, debt => ({
          title: formatDebtPnl(debt, borrowSymbol ?? UNAVAILABLE_TOKEN_SYMBOL),
          ...BORROW_METRIC_TOOLTIP,
        }))}
      />
    </>
  )
}
