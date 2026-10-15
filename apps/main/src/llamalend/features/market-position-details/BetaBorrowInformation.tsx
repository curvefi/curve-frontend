import { ESTIMATED_LEVERAGED_APR_TITLE } from '@/llamalend/constants'
import {
  formatBandSpan,
  formatCompositionLabels,
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
import { isPositionLeveraged, type MarketTokensOrEmpty } from '@/llamalend/llama.utils'
import type { BorrowPositionView } from '@/llamalend/position-metrics/use-borrow-position-view'
import { PnlLine } from '@/llamalend/widgets/PnlLine'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import { Metric } from '@ui/components/Metric'
import { mapQuery, q } from '@ui/features/queries/util'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { t } from '@ui/lib/i18n'
import { UNAVAILABLE_TOKEN_SYMBOL } from '@ui/lib/tokens'

const METRIC_CATEGORY = 'llamalend.positionBorrowDetails'
const OPENING_LEVERAGE_FORMAT = { abbreviate: false, maximumSignificantDigits: 3, unit: 'multiplier' } as const

export const BetaBorrowInformation = ({
  view,
  tokens: { collateralToken, borrowToken },
}: {
  view: BorrowPositionView
  tokens: MarketTokensOrEmpty
}) => {
  const theme = useTheme()
  const isMobile = useIsMobile()
  const borrowSymbol = borrowToken?.symbol ?? UNAVAILABLE_TOKEN_SYMBOL
  const compositionLabels = formatCompositionLabels(view.composition)
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
            view.distance.data?.location === 'inside' &&
            compositionLabels && (
              <Typography variant="highlightXsNotional" color="textTertiary" data-testid="range-converted-share">
                {t`${compositionLabels.borrowed} converted to ${borrowSymbol}`}
              </Typography>
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
          notional={maybe(view.pnl.data, pnl => (
            <PnlLine
              pnl={pnl}
              collateralSymbol={collateralToken?.symbol ?? UNAVAILABLE_TOKEN_SYMBOL}
              borrowSymbol={borrowSymbol}
              variant="highlightXsNotional"
              testId="position-pnl"
            />
          ))}
        />
      </Box>
      <Box sx={{ gridArea: 'leverage' }}>
        {(isMobile || isPositionLeveraged(view.leverage.data)) && (
          <Metric
            category="llamalend.positionCardTop"
            label={t`Leverage`}
            testId="position-leverage"
            value={view.leverage}
            valueOptions={{ unit: 'multiplier' }}
            valueTooltip={leverageTooltip()}
            notional={maybe(view.openingLeverage.data, opening => (
              <Typography variant="highlightXsNotional" color="textTertiary" data-testid="position-opening-leverage">
                {t`Opened at`} {formatNumber(opening, OPENING_LEVERAGE_FORMAT)}
              </Typography>
            ))}
          />
        )}
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
              unit: { symbol: '% APR', position: 'suffix' },
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
