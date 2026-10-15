import {
  formatCompositionLabels,
  formatRangeLabel,
  inclusiveBandCount,
} from '@/llamalend/features/market-position-details/position-metrics.utils'
import { collateralTooltip, debtTooltip } from '@/llamalend/features/market-position-details/PositionMetricTooltip'
import type { MarketTokensOrEmpty } from '@/llamalend/llama.utils'
import type { BorrowPositionView } from '@/llamalend/position-metrics/use-borrow-position-view'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import { useTheme } from '@mui/material/styles'
import { formatNumber } from '@primitives/number.utils'
import { maybes } from '@primitives/objects.utils'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { q } from '@ui/features/queries/util'
import { usePositionDetailsOpen } from '@ui/features/storage/useLocalStorage'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { decimalMultiply } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { UNAVAILABLE_TOKEN_SYMBOL } from '@ui/lib/tokens'
import { POSITION_CARD_COLUMN_GAP, POSITION_CARD_COLUMNS } from './position-card.layout'

const { Spacing } = SizesAndSpaces

const METRIC_CATEGORY = 'llamalend.positionBorrowDetails'

/** Secondary position metrics, folded by default. The card header toggles them and remembers the choice. */
export const BetaPositionMoreDetails = ({
  view,
  tokens: { collateralToken, borrowToken },
}: {
  view: BorrowPositionView
  tokens: MarketTokensOrEmpty
}) => {
  const theme = useTheme()
  const [open] = usePositionDetailsOpen()
  const borrowSymbol = borrowToken?.symbol ?? UNAVAILABLE_TOKEN_SYMBOL
  const shares = view.composition
  const compositionLabels = formatCompositionLabels(shares)
  const debtUsdValue = maybes([view.debt.data, view.borrowUsdRate.data], (debt, rate) =>
    formatNumber(decimalMultiply(debt, rate), 'usd.notional'),
  )
  const prices = view.userPrices.data
  return (
    <Collapse in={open} data-testid="position-more-details">
      <MetricsGrid
        sx={{
          paddingInline: Spacing.md,
          paddingBlockEnd: Spacing.md,
          alignItems: 'start',
          gridTemplateColumns: POSITION_CARD_COLUMNS,
          gridTemplateAreas: {
            mobile: '"collateral" "bands" "debt" "prices"',
            tablet: '"collateral debt prices bands"',
          },
          columnGap: POSITION_CARD_COLUMN_GAP,
          rowGap: Spacing.xs,
        }}
      >
        <Box sx={{ gridArea: 'collateral' }}>
          <Metric
            category={METRIC_CATEGORY}
            label={t`Collateral value`}
            testId="position-collateral-value"
            value={view.collateral}
            valueOptions={{ unit: { symbol: borrowSymbol, position: 'suffix' } }}
            valueAdornment={
              compositionLabels &&
              shares && (
                <Box
                  data-testid="collateral-composition"
                  role="img"
                  aria-label={t`Collateral composition: ${compositionLabels.collateral} ${collateralToken?.symbol ?? UNAVAILABLE_TOKEN_SYMBOL}, ${compositionLabels.borrowed} ${borrowSymbol}`}
                  sx={{
                    width: 16,
                    height: 16,
                    flexShrink: 0,
                    alignSelf: 'center',
                    ml: 1,
                    borderRadius: '50%',
                    background: `conic-gradient(${theme.design.Layer.Feedback.Success} 0% ${shares.collateralLabel}%, ${theme.design.Layer.Feedback.Warning} ${shares.collateralLabel}% 100%)`,
                  }}
                />
              )
            }
            valueTooltip={collateralTooltip({
              collateralShare: compositionLabels ? compositionLabels.collateral : undefined,
              convertedShare: compositionLabels ? compositionLabels.borrowed : undefined,
              collateralSymbol: collateralToken?.symbol ?? UNAVAILABLE_TOKEN_SYMBOL,
              convertedSymbol: borrowSymbol,
            })}
          />
        </Box>
        <Box sx={{ gridArea: 'debt' }}>
          <Metric
            category={METRIC_CATEGORY}
            label={t`Total debt`}
            value={view.debt}
            valueOptions={{ unit: { symbol: borrowSymbol, position: 'suffix' } }}
            valueTooltip={debtTooltip({ usdValue: debtUsdValue })}
          />
        </Box>{' '}
        <Box sx={{ gridArea: 'prices' }}>
          <Metric
            category={METRIC_CATEGORY}
            label={t`Liquidation range`}
            testId="position-liquidation-range-prices"
            value={q({
              data: prices ? formatRangeLabel(prices[1], prices[0], view.priceUnit) : undefined,
              isLoading: view.userPrices.isLoading,
              error: view.userPrices.error,
            })}
            valueOptions={{ abbreviate: false }}
          />
        </Box>
        <Box sx={{ gridArea: 'bands' }}>
          <Metric
            category={METRIC_CATEGORY}
            label={t`Bands`}
            testId="position-band-count"
            value={q({
              data: view.bands ? inclusiveBandCount(view.bands[0], view.bands[1]) : undefined,
              isLoading: view.bands == null && view.userPrices.isLoading,
              error: null,
            })}
            valueOptions={{ abbreviate: false, decimals: 0 }}
          />
        </Box>
      </MetricsGrid>
    </Collapse>
  )
}
