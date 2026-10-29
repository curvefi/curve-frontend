import type { PositionPnlAndEquityQueries } from '@/llamalend/hooks/usePositionPnlAndEquity'
import { tokenMetric } from '@/llamalend/llama.utils'
import { DebtPnlTooltipContent } from '@/llamalend/widgets/tooltips/DebtPnlTooltipContent'
import { EquityTooltipContent } from '@/llamalend/widgets/tooltips/EquityTooltipContent'
import { PnlTooltipContent } from '@/llamalend/widgets/tooltips/PnlTooltipContent'
import type { Amount } from '@primitives/decimal.utils'
import { UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import { Metric } from '@ui/components/Metric'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { UNAVAILABLE_TOKEN_SYMBOL } from '@ui/lib/tokens'
import { BORROW_METRIC_CATEGORY, BORROW_METRIC_TOOLTIP } from './market-position-details.utils'

type PnlMetricsProps = PositionPnlAndEquityQueries & {
  borrowSymbol: string | undefined
  collateralSymbol: string | undefined
  borrowUsdRate: QueryProp<Amount>
  collateralUsdRate: QueryProp<Amount>
}

/** Equity in the borrowed token and PNL (ROI %) in the collateral token, each with its USD value */
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
        label={t`PNL (ROI %)`}
        labelTooltip={{ title: t`PNL (ROI %)`, body: <PnlTooltipContent />, ...BORROW_METRIC_TOOLTIP }}
        {...pnlMetric}
        valueOptions={{ ...pnlMetric.valueOptions, fallback: UNAVAILABLE_NOTATION }}
        change={maybe(pnl.data?.collateral?.roi, Number)}
        valueTooltip={maybe(pnl.data?.debt, debt => ({
          title: t`PNL (ROI %)`,
          body: <DebtPnlTooltipContent pnl={debt} symbol={borrowSymbol ?? UNAVAILABLE_TOKEN_SYMBOL} />,
          ...BORROW_METRIC_TOOLTIP,
        }))}
      />
    </>
  )
}
