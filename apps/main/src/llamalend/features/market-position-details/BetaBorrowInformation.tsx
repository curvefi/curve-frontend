import { ESTIMATED_LEVERAGED_APR_TITLE } from '@/llamalend/constants'
import {
  formatBandSpan,
  formatPriceDistanceHeadline,
  formatPriceDistanceDescription,
  inclusiveBandCount,
} from '@/llamalend/features/market-position-details/position-metrics.utils'
import {
  collateralTooltip,
  debtTooltip,
  leverageTooltip,
  rangeTooltip,
  roeTooltip,
} from '@/llamalend/features/market-position-details/PositionMetricTooltip'
import { isPositionLeveraged, type MarketTokensOrEmpty } from '@/llamalend/llama.utils'
import type { BorrowPositionView } from '@/llamalend/position-metrics/use-borrow-position-view'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { formatNumber } from '@primitives/number.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import { LinearProgress } from '@ui/components/LinearProgress'
import { Metric } from '@ui/components/Metric'
import { mapQuery, q } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { decimalMultiply } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { UNAVAILABLE_TOKEN_SYMBOL } from '@ui/lib/tokens'

const METRIC_CATEGORY = 'llamalend.positionBorrowDetails'
const { Spacing } = SizesAndSpaces

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
  const shares = view.composition
  const compositionLabels = shares
    ? {
        collateral: formatNumber(shares.collateralLabel, 'percent.rate'),
        borrowed: formatNumber(shares.borrowedLabel, 'percent.rate'),
      }
    : undefined
  const debtUsdValue = maybes([view.debt.data, view.borrowUsdRate.data], (debt, rate) =>
    formatNumber(decimalMultiply(debt, rate), 'usd.notional'),
  )
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
      <Stack sx={{ gridArea: 'collateral', gap: Spacing.xxs }}>
        <Metric
          category={METRIC_CATEGORY}
          label={t`Collateral value`}
          testId="position-collateral-value"
          value={view.collateral}
          valueOptions={{ unit: { symbol: borrowSymbol, position: 'suffix' } }}
          valueTooltip={collateralTooltip({
            collateralShare: compositionLabels ? compositionLabels.collateral : undefined,
            convertedShare: compositionLabels ? compositionLabels.borrowed : undefined,
            collateralSymbol: collateralToken?.symbol ?? UNAVAILABLE_TOKEN_SYMBOL,
            convertedSymbol: borrowSymbol,
          })}
        />
        {compositionLabels && shares && (
          <Stack data-testid="collateral-composition" sx={{ gap: Spacing.xxs }}>
            <LinearProgress
              percent={Number(shares.collateralLabel)}
              size="small"
              barColor={theme.design.Layer.Feedback.Success}
              trackColor={theme.design.Layer.Feedback.Warning}
            />
          </Stack>
        )}
      </Stack>
      <Box sx={{ gridArea: 'debt' }}>
        <Metric
          category={METRIC_CATEGORY}
          label={t`Total debt`}
          value={view.debt}
          valueOptions={{ unit: { symbol: borrowSymbol, position: 'suffix' } }}
          valueTooltip={debtTooltip({ usdValue: debtUsdValue })}
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
