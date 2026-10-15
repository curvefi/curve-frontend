import { ESTIMATED_LEVERAGED_APR_TITLE } from '@/llamalend/constants'
import {
  formatBandSpan,
  formatPriceDistanceHeadline,
  formatPriceDistanceDescription,
  inclusiveBandCount,
} from '@/llamalend/features/market-position-details/position-metrics.utils'
import {
  equityTooltip,
  leverageTooltip,
  rangeTooltip,
  roeTooltip,
} from '@/llamalend/features/market-position-details/PositionMetricTooltip'
import type { MarketTokensOrEmpty } from '@/llamalend/llama.utils'
import type { BorrowPositionView } from '@/llamalend/position-metrics/use-borrow-position-view'
import { PnlInDebtToken } from '@/llamalend/widgets/PnlLine'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import { Metric } from '@ui/components/Metric'
import { mapQuery, q } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { UNAVAILABLE_TOKEN_SYMBOL } from '@ui/lib/tokens'

const METRIC_CATEGORY = 'llamalend.positionBorrowDetails'

export const BetaBorrowInformation = ({
  view,
  tokens: { collateralToken, borrowToken },
}: {
  view: BorrowPositionView
  tokens: MarketTokensOrEmpty
}) => {
  const theme = useTheme()
  const borrowSymbol = borrowToken?.symbol ?? UNAVAILABLE_TOKEN_SYMBOL
  const collateralSymbol = collateralToken?.symbol ?? UNAVAILABLE_TOKEN_SYMBOL
  const roe = view.roe.data
  const multiplier = roe?.status === 'value' ? roe.multiplier : undefined
  return (
    <>
      <Box
        sx={{ gridArea: 'range' }}
        data-testid="beta-borrow-information"
        role="group"
        aria-label={maybe(view.distance.data, formatPriceDistanceDescription)}
      >
        <Metric
          category="llamalend.positionCardTop"
          label={t`Distance to range`}
          testId="liquidation-range"
          value={mapQuery(view.distance, formatPriceDistanceHeadline)}
          valueOptions={{ abbreviate: false }}
          sx={{ whiteSpace: { mobile: 'normal', tablet: 'nowrap' } }}
          valueTooltip={rangeTooltip({
            pair: view.priceUnit,
            upper: view.userPrices.data ? formatNumber(view.userPrices.data[1], { abbreviate: true }) : undefined,
            lower: view.userPrices.data ? formatNumber(view.userPrices.data[0], { abbreviate: true }) : undefined,
            bandCount: view.bands ? inclusiveBandCount(view.bands[0], view.bands[1]) : undefined,
            bandRange: view.bands ? formatBandSpan(view.bands[0], view.bands[1]) : undefined,
          })}
        />
      </Box>
      <Box sx={{ gridArea: 'equity' }}>
        <Metric
          category={METRIC_CATEGORY}
          label={t`Equity`}
          testId="position-equity"
          value={view.equity}
          valueOptions={{ unit: { symbol: borrowSymbol, position: 'suffix' } }}
          valueTooltip={equityTooltip()}
        />
      </Box>
      <Box sx={{ gridArea: 'pnl' }}>
        <Metric
          category={METRIC_CATEGORY}
          label={t`PNL (ROE %)`}
          testId="position-pnl"
          value={mapQuery(view.pnl, pnl => maybe(pnl?.pnlCollateral, Number))}
          valueOptions={{
            unit: { symbol: collateralSymbol, position: 'suffix' },
            formatter: value => `${Number(value) > 0 ? '+' : ''}${formatNumber(value, { abbreviate: true })}`,
          }}
          change={maybe(view.pnl.data?.percentCollateral, Number)}
          valueTooltip={maybe(view.pnl.data, pnl => ({
            title: t`PNL (ROE %)`,
            body: <PnlInDebtToken pnl={pnl} borrowSymbol={borrowSymbol} />,
            placement: 'top' as const,
            arrow: false,
          }))}
        />
      </Box>
      <Box sx={{ gridArea: 'leverage' }}>
        <Metric
          category={METRIC_CATEGORY}
          label={t`Leverage`}
          testId="position-leverage"
          value={view.leverage}
          valueOptions={{ unit: 'multiplier' }}
          valueTooltip={leverageTooltip()}
        />
      </Box>
      {roe?.status !== 'hidden' && (
        <Box sx={{ gridArea: 'roe' }}>
          <Metric
            category={METRIC_CATEGORY}
            label={ESTIMATED_LEVERAGED_APR_TITLE}
            testId="position-roe"
            value={q({
              data: roe?.status === 'value' ? roe.aprPercent : undefined,
              isLoading: view.roe.isLoading,
              error:
                roe?.status === 'unavailable'
                  ? new Error('A required yield or borrow rate is unavailable.')
                  : view.roe.error,
            })}
            valueOptions={{
              unit: 'percentage',
              ...(roe?.status === 'value' && roe.multiplier.kind === 'negative'
                ? { color: theme.design.Text.TextColors.Feedback.Error }
                : {}),
            }}
            valueTooltip={roeTooltip({
              yieldMultiplier:
                multiplier && multiplier.kind !== 'omit'
                  ? formatNumber(multiplier.kind === 'zero' ? 0 : multiplier.value, 'multiplier')
                  : undefined,
            })}
          />
        </Box>
      )}
    </>
  )
}
