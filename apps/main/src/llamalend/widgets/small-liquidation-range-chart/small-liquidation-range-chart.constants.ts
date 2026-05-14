import { t } from '@ui-kit/lib/i18n'
import { CHART_LINE_DASH_PATTERNS, CHART_LINE_WIDTHS } from '@ui-kit/shared/ui/Chart/chart.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const CHART_LAYOUT = {
  trackHeight: 24,
  axisHeight: 24,
  rangeBorderGutter: CHART_LINE_WIDTHS.referenceLine,
  priceMarker: {
    tickHeight: 6,
    labelGap: 6,
  },
} as const

export const ORACLE_MARKER_ARROW = {
  width: 11,
  height: 9,
  pathData: 'M5.19641 9L0.000234437 -0.0000342871L10.3926 -0.0000333786L5.19641 9Z',
} as const

export const ORACLE_MARKER_LAYOUT = {
  arrow: ORACLE_MARKER_ARROW,
  label: {
    height: CHART_LAYOUT.trackHeight - ORACLE_MARKER_ARROW.height,
    horizontalPadding: Spacing.xs.desktop,
    // ECharts custom-series renderItem does not expose canvas text measurement.
    // Estimate numeric label width from the average glyph width so the oracle
    // label can be clamped inside the chart while keeping the arrow attached.
    estimatedCharacterWidthRatio: 0.58,
  },
} as const

export const SMALL_LIQUIDATION_RANGE_CHART_HEIGHT_PX =
  CHART_LAYOUT.trackHeight + CHART_LAYOUT.axisHeight + CHART_LAYOUT.rangeBorderGutter * 2

export const FULL_RANGE_Y_AXIS = [0, 1] as const
export const INSET_RANGE_Y_AXIS = [0.08, 0.92] as const
export const NEW_RANGE_BORDER_DASH = CHART_LINE_DASH_PATTERNS.regular
export const RANGE_LABEL = t`LR`

// Rail coordinates, not prices: edge of chart, "..." break label, rounded terminal tick.
export const SMALL_LIQUIDATION_RANGE_CHART_ORACLE_RAIL_AXIS = {
  min: 0,
  breakTick: 1,
  max: 2,
} as const

// Split mode deliberately reserves a small, fixed-width rail for distant oracle prices.
// The rail is schematic, not a real price scale, so the liquidation range keeps almost all
// of the available width while the oracle still has a visible marker and terminal tick.
export const SPLIT_ORACLE_RAIL = {
  width: 64,
  // Synthetic rail units, not pixels: keep the oracle marker away from the "..."
  // break tick at 1 so the marker reads as being on the truncated side of the rail.
  markerBreakGap: 0.35,
} as const
