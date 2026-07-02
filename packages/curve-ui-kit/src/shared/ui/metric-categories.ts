import { Breakpoint } from '@mui/material'
import { mapRecord } from '@primitives/objects.utils'

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
): MetricViewportLayout =>
  mapRecord(METRIC_EMPHASIS[emphasis], (breakpoint, size) => ({
    size,
    orientation: METRIC_PRESENTATION[presentation][breakpoint],
  }))

/**
 * Reusable metric layout types composed from emphasis and presentation design choices.
 */
const METRIC_TYPES = {
  primaryStat: metricLayout('primary', 'stack'),
  secondaryStat: metricLayout('secondary', 'stack'),
  responsiveStat: metricLayout('responsive', 'stack'),
  responsiveDetail: metricLayout('responsive', 'detail'),
  primaryDetail: metricLayout('primary', 'detail'),
  secondaryDetail: metricLayout('secondary', 'detail'),
  primaryInline: metricLayout('primary', 'inline'),
} as const satisfies Record<string, MetricViewportLayout>

/**
 * App-specific categories map each Metric placement to one reusable layout type.
 * Format: 'app.surface' or 'app.surface.metricGroup'.
 */
export const METRIC_CATEGORIES = {
  // Storybook
  'storybook.metric.standard': METRIC_TYPES.primaryStat,
  'storybook.metric.compact': METRIC_TYPES.secondaryStat,
  'storybook.metric.horizontal': METRIC_TYPES.primaryInline,

  // DAO
  'dao.crvStats': METRIC_TYPES.secondaryStat,

  // DEX
  'dex.poolHeader': METRIC_TYPES.primaryStat,
  'dex.poolInformation': METRIC_TYPES.primaryStat,
  'dex.userLiquidityDetails': METRIC_TYPES.primaryStat,
  'dex.refuelCharts': METRIC_TYPES.primaryStat,
  'dex.refuelPoolInformation': METRIC_TYPES.responsiveStat,
  'dex.poolListMobileExpanded': METRIC_TYPES.primaryStat,
  'dex.legacyPoolListMobileExpanded': METRIC_TYPES.primaryStat,

  // LlamaLend
  'llamalend.marketHeader': METRIC_TYPES.primaryStat,
  'llamalend.marketCharts': METRIC_TYPES.primaryStat,
  'llamalend.marketAdvancedDetails': METRIC_TYPES.responsiveDetail,
  'llamalend.marketListRates': METRIC_TYPES.primaryStat,
  'llamalend.marketListExpandedDetails': METRIC_TYPES.responsiveDetail,
  'llamalend.marketListPosition': METRIC_TYPES.responsiveDetail,
  'llamalend.marketListSummary': METRIC_TYPES.primaryDetail,
  'llamalend.positionBorrowDetails': METRIC_TYPES.secondaryDetail,
  'llamalend.positionSupplyDetails': METRIC_TYPES.secondaryDetail,
  'llamalend.positionHealth': METRIC_TYPES.primaryStat,

  // crvUSD / loan
  'loan.scrvusdBanner': METRIC_TYPES.primaryStat,
  'loan.scrvusdStats': METRIC_TYPES.secondaryDetail,
  'loan.scrvusdUserPositionPrimary': METRIC_TYPES.primaryStat,
  'loan.scrvusdUserPositionSecondary': METRIC_TYPES.secondaryDetail,
  'loan.pegKeeperOverview': METRIC_TYPES.primaryStat,
  'loan.pegKeeperDetailAmounts': METRIC_TYPES.secondaryStat,
} as const satisfies Record<string, MetricViewportLayout>

export type MetricCategory = keyof typeof METRIC_CATEGORIES
