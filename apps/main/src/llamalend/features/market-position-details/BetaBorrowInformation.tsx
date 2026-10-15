import { ESTIMATED_LEVERAGED_APR_TITLE } from '@/llamalend/constants'
import {
  formatBandSpan,
  formatPriceDistanceHeadline,
  formatPriceDistanceDescription,
  formatRangeLabel,
  inclusiveBandCount,
} from '@/llamalend/features/market-position-details/position-metrics.utils'
import { formatYieldMultiplier } from '@/llamalend/features/market-position-details/position-roe.utils'
import {
  equityTooltip,
  leverageTooltip,
  rangeTooltip,
  roeTooltip,
} from '@/llamalend/features/market-position-details/PositionMetricTooltip'
import type { MarketTokensOrEmpty } from '@/llamalend/llama.utils'
import type { BorrowPositionView } from '@/llamalend/position-metrics/use-borrow-position-view'
import { signedAmount } from '@/llamalend/widgets/pnl.utils'
import { PnlInDebtToken } from '@/llamalend/widgets/PnlLine'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { formatNumber } from '@primitives/number.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import { Metric } from '@ui/components/Metric'
import { mapQuery, q } from '@ui/features/queries/util'
import { usePositionDetailsOpen } from '@ui/features/storage/useLocalStorage'
import { decimalMultiply } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { UNAVAILABLE_TOKEN_SYMBOL } from '@ui/lib/tokens'
import { NotionalText } from './NotionalText'

const METRIC_CATEGORY = 'llamalend.positionBorrowDetails'
// Same format as the positions table leverage cell.
const LEVERAGE_FORMAT = { abbreviate: false, maximumSignificantDigits: 3, unit: 'multiplier' } as const

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
  // Notionals add a second line to each metric, so they only show with More details open.
  // Each one repeats the support line of the matching positions table column.
  const [detailsOpen] = usePositionDetailsOpen()
  const prices = view.userPrices.data
  const equityUsd = maybes([view.equity.data, view.borrowUsdRate.data], (amount, rate) =>
    formatNumber(decimalMultiply(amount, rate), 'usd.notional'),
  )
  const pnlUsd = maybes([view.pnl.data?.pnl, view.borrowUsdRate.data], (pnl, rate) => {
    const usd = Number(decimalMultiply(pnl, rate))
    return `${usd > 0 ? '+' : usd < 0 ? '-' : ''}${formatNumber(Math.abs(usd), 'usd.notional')}`
  })
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
          notional={
            detailsOpen && (
              <NotionalText
                text={maybe(prices, ([lower, upper]) => formatRangeLabel(upper, lower, view.priceUnit))}
                testId="range-prices"
              />
            )
          }
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
          notional={detailsOpen && <NotionalText text={equityUsd} testId="position-equity-usd" />}
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
            formatter: value => signedAmount(Number(value)),
          }}
          // Figma metric: ROE % sits beside the value, USD below it with More details open.
          change={maybe(view.pnl.data?.percentCollateral, Number)}
          notional={detailsOpen && <NotionalText text={pnlUsd} testId="position-pnl-usd" />}
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
          valueTooltip={leverageTooltip({
            openedAt: maybe(view.openingLeverage.data, opening => formatNumber(opening, LEVERAGE_FORMAT)),
          })}
          notional={
            detailsOpen && (
              <NotionalText
                text={maybe(view.maxLeverage, max => t`Max ${formatNumber(max, LEVERAGE_FORMAT)}`)}
                testId="position-max-leverage"
              />
            )
          }
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
            notional={
              detailsOpen && (
                <NotionalText text={maybe(multiplier, formatYieldMultiplier)} testId="position-yield-multiplier" />
              )
            }
          />
        </Box>
      )}
    </>
  )
}
