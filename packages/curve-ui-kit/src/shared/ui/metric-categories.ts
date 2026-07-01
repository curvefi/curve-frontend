import { Breakpoint } from '@mui/material'

export type MetricLayout = {
  size: 'small' | 'medium' | 'large' | 'extraLarge'
  orientation: 'vertical' | 'horizontal'
}

type MetricViewportLayout = Record<Breakpoint, MetricLayout>

/**
 * First level, we keep the Metric layout behaviors used across the app in a small set of reusable types.
 */
export const METRIC_TYPES = {
  standard: {
    mobile: { size: 'medium', orientation: 'vertical' },
    tablet: { size: 'medium', orientation: 'vertical' },
    desktop: { size: 'medium', orientation: 'vertical' },
  },
  compact: {
    mobile: { size: 'small', orientation: 'vertical' },
    tablet: { size: 'small', orientation: 'vertical' },
    desktop: { size: 'small', orientation: 'vertical' },
  },
  mobileCompact: {
    mobile: { size: 'small', orientation: 'vertical' },
    tablet: { size: 'medium', orientation: 'vertical' },
    desktop: { size: 'medium', orientation: 'vertical' },
  },
  mobileCompactRow: {
    mobile: { size: 'small', orientation: 'horizontal' },
    tablet: { size: 'medium', orientation: 'vertical' },
    desktop: { size: 'medium', orientation: 'vertical' },
  },
  mobileStandardRow: {
    mobile: { size: 'medium', orientation: 'horizontal' },
    tablet: { size: 'medium', orientation: 'vertical' },
    desktop: { size: 'medium', orientation: 'vertical' },
  },
  compactMobileRow: {
    mobile: { size: 'small', orientation: 'horizontal' },
    tablet: { size: 'small', orientation: 'vertical' },
    desktop: { size: 'small', orientation: 'vertical' },
  },
  standardRow: {
    mobile: { size: 'medium', orientation: 'horizontal' },
    tablet: { size: 'medium', orientation: 'horizontal' },
    desktop: { size: 'medium', orientation: 'horizontal' },
  },
} as const satisfies Record<string, MetricViewportLayout>

/**
 * Second level, the app-specific categories map each Metric placement to one reusable layout type.
 * Format: 'app.surface' or 'app.surface.metricGroup'.
 */
export const METRIC_CATEGORIES = {
  // Storybook
  'storybook.metric.standard': METRIC_TYPES.standard,
  'storybook.metric.compact': METRIC_TYPES.compact,
  'storybook.metric.horizontal': METRIC_TYPES.standardRow,

  // DAO
  'dao.crvStats': METRIC_TYPES.compact,

  // DEX
  'dex.poolHeader': METRIC_TYPES.standard,
  'dex.poolInformation': METRIC_TYPES.standard,
  'dex.userLiquidityDetails': METRIC_TYPES.standard,
  'dex.refuelCharts': METRIC_TYPES.standard,
  'dex.refuelPoolInformation': METRIC_TYPES.mobileCompact,
  'dex.poolListMobileExpanded': METRIC_TYPES.standard,
  'dex.legacyPoolListMobileExpanded': METRIC_TYPES.standard,

  // LlamaLend
  'llamalend.marketHeader': METRIC_TYPES.standard,
  'llamalend.marketCharts': METRIC_TYPES.standard,
  'llamalend.marketAdvancedDetails': METRIC_TYPES.mobileCompactRow,
  'llamalend.marketListRates': METRIC_TYPES.standard,
  'llamalend.marketListExpandedDetails': METRIC_TYPES.mobileCompactRow,
  'llamalend.marketListPosition': METRIC_TYPES.mobileCompactRow,
  'llamalend.marketListSummary': METRIC_TYPES.mobileStandardRow,
  'llamalend.positionBorrowDetails': METRIC_TYPES.compactMobileRow,
  'llamalend.positionSupplyDetails': METRIC_TYPES.compactMobileRow,
  'llamalend.positionHealth': METRIC_TYPES.standard,

  // crvUSD / loan
  'loan.scrvusdBanner': METRIC_TYPES.standard,
  'loan.scrvusdStats': METRIC_TYPES.compact,
  'loan.scrvusdUserPositionPrimary': METRIC_TYPES.standard,
  'loan.scrvusdUserPositionSecondary': METRIC_TYPES.compact,
  'loan.pegKeeperOverview': METRIC_TYPES.standard,
  'loan.pegKeeperDetailAmounts': METRIC_TYPES.compact,
} as const satisfies Record<string, MetricViewportLayout>

export type MetricCategory = keyof typeof METRIC_CATEGORIES
