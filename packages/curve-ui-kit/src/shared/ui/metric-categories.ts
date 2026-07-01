import { Breakpoint } from '@mui/material'

export type MetricLayout = {
  size: 'small' | 'medium' | 'large' | 'extraLarge'
  orientation: 'vertical' | 'horizontal'
}

type MetricViewportLayout = Record<Breakpoint, MetricLayout>

const breakpointValues = <Value>(value: Value): Record<Breakpoint, Value> => ({
  mobile: value,
  tablet: value,
  desktop: value,
})

/**
 * Metric emphasis defines the visual hierarchy of a metric across breakpoints.
 * - primary: dominant page metrics.
 * - secondary: dense supporting metrics.
 * - responsive: metrics that need less emphasis on mobile.
 */
const METRIC_EMPHASIS = {
  primary: breakpointValues('medium'),
  secondary: breakpointValues('small'),
  responsive: {
    mobile: 'small',
    tablet: 'medium',
    desktop: 'medium',
  },
} as const satisfies Record<string, Record<Breakpoint, MetricLayout['size']>>

/**
 * Metric presentation defines how label and value relate in the available space.
 * - stack: standalone stat blocks.
 * - detail: mobile list/detail rows.
 * - inline: horizontal metric groups.
 */
const METRIC_PRESENTATION = {
  stack: breakpointValues('vertical'),
  detail: {
    mobile: 'horizontal',
    tablet: 'vertical',
    desktop: 'vertical',
  },
  inline: breakpointValues('horizontal'),
} as const satisfies Record<string, Record<Breakpoint, MetricLayout['orientation']>>

const metricLayout = (
  emphasis: keyof typeof METRIC_EMPHASIS,
  presentation: keyof typeof METRIC_PRESENTATION,
): MetricViewportLayout => ({
  mobile: { size: METRIC_EMPHASIS[emphasis].mobile, orientation: METRIC_PRESENTATION[presentation].mobile },
  tablet: { size: METRIC_EMPHASIS[emphasis].tablet, orientation: METRIC_PRESENTATION[presentation].tablet },
  desktop: { size: METRIC_EMPHASIS[emphasis].desktop, orientation: METRIC_PRESENTATION[presentation].desktop },
})

/**
 * App-specific categories map each Metric placement to a composed emphasis and presentation.
 * Format: 'app.surface' or 'app.surface.metricGroup'.
 */
export const METRIC_CATEGORIES = {
  // Storybook
  'storybook.metric.standard': metricLayout('primary', 'stack'),
  'storybook.metric.compact': metricLayout('secondary', 'stack'),
  'storybook.metric.horizontal': metricLayout('primary', 'inline'),

  // DAO
  'dao.crvStats': metricLayout('secondary', 'stack'),

  // DEX
  'dex.poolHeader': metricLayout('primary', 'stack'),
  'dex.poolInformation': metricLayout('primary', 'stack'),
  'dex.userLiquidityDetails': metricLayout('primary', 'stack'),
  'dex.refuelCharts': metricLayout('primary', 'stack'),
  'dex.refuelPoolInformation': metricLayout('responsive', 'stack'),
  'dex.poolListMobileExpanded': metricLayout('primary', 'stack'),
  'dex.legacyPoolListMobileExpanded': metricLayout('primary', 'stack'),

  // LlamaLend
  'llamalend.marketHeader': metricLayout('primary', 'stack'),
  'llamalend.marketCharts': metricLayout('primary', 'stack'),
  'llamalend.marketAdvancedDetails': metricLayout('responsive', 'detail'),
  'llamalend.marketListRates': metricLayout('primary', 'stack'),
  'llamalend.marketListExpandedDetails': metricLayout('responsive', 'detail'),
  'llamalend.marketListPosition': metricLayout('primary', 'stack'),
  'llamalend.marketListSummary': metricLayout('primary', 'detail'),
  'llamalend.positionBorrowDetails': metricLayout('secondary', 'detail'),
  'llamalend.positionSupplyDetails': metricLayout('secondary', 'detail'),
  'llamalend.positionHealth': metricLayout('primary', 'stack'),

  // crvUSD / loan
  'loan.scrvusdBanner': metricLayout('primary', 'stack'),
  'loan.scrvusdStats': metricLayout('secondary', 'detail'),
  'loan.scrvusdUserPositionPrimary': metricLayout('primary', 'stack'),
  'loan.scrvusdUserPositionSecondary': metricLayout('secondary', 'detail'),
  'loan.pegKeeperOverview': metricLayout('primary', 'stack'),
  'loan.pegKeeperDetailAmounts': metricLayout('secondary', 'stack'),
} as const satisfies Record<string, MetricViewportLayout>

export type MetricCategory = keyof typeof METRIC_CATEGORIES
