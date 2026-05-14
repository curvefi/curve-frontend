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
    // Approximate average glyph width in em for numeric price labels when sizing the custom ECharts marker.
    estimatedCharacterWidthRatio: 0.58,
  },
} as const

export const SMALL_LIQUIDATION_RANGE_CHART_HEIGHT_PX =
  CHART_LAYOUT.trackHeight + CHART_LAYOUT.axisHeight + CHART_LAYOUT.rangeBorderGutter * 2

export const FULL_RANGE_Y_AXIS = [0, 1] as const
export const NEW_RANGE_BORDER_DASH = CHART_LINE_DASH_PATTERNS.regular
export const RANGE_LABEL = t`LR`

// Split mode uses two ECharts grids: one for the real range scale and one narrow rail for a distant oracle.
export const SPLIT_GRID = {
  oracleRailWidth: 16,
  mainWidth: 84,
} as const
