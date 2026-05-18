import { meanBy } from 'lodash'
import { movingAverage } from '@primitives/array.utils'
import { TIME_FRAMES } from '@ui-kit/lib/model/time'
import { formatNumber, type NumberFormatOptions } from '@ui-kit/utils/number'

export type ChartLineDashPattern = number[]

export const DEFAULT_CHART_SIGNIFICANT_DIGITS = 5
const DEFAULT_CHART_ABBREVIATE_FROM = 10000

export const CHART_LINE_DASH_PATTERNS = {
  /** Matches lightweight-charts LineStyle.Dashed with the default 1px price line width. */
  tight: [2, 2],
  short: [4, 2],
  /** Matches lightweight-charts LineStyle.Dashed with the chart line width assumption of 2px.  */
  regular: [4, 4],
  wide: [8, 8],
} satisfies Record<string, ChartLineDashPattern>

export const CHART_LINE_WIDTHS = {
  defaultPriceLine: 1,
  referenceLine: 2,
} as const

/**
 * Formats numeric chart labels with a compact significant-digit default.
 *
 * This is intentionally a thin preset over `formatNumber`: chart axes should use significant digits rather than fixed
 * decimals, abbreviate only from 10k so values like `4013` stay literal, and inherit `formatNumber`'s near-0/near-1
 * protection with the shared significant-digit cap.
 */
export const formatChartAxisNumber = (
  value: number,
  options: Omit<
    Partial<NumberFormatOptions>,
    'abbreviate' | 'formatter' | 'maximumSignificantDigits' | 'minimumSignificantDigits'
  > & {
    /**
     * Chart labels need compact, comparable values. Significant digits keep labels like `4013` readable while preserving
     * small price moves better than a fixed decimal count.
     */
    significantDigits?: number
    /**
     * Axis labels only abbreviate above 10k by default so values like `4013` stay literal instead of becoming `4.013k`.
     * Pass `false` for price ranges or tooltips that should never abbreviate.
     */
    abbreviateFrom?: number | false
  } = {},
) => {
  const {
    significantDigits = DEFAULT_CHART_SIGNIFICANT_DIGITS,
    abbreviateFrom = DEFAULT_CHART_ABBREVIATE_FROM,
    useGrouping = false,
    ...formatOptions
  } = options

  return formatNumber(value, {
    ...formatOptions,
    abbreviate: abbreviateFrom !== false && Math.abs(value) >= abbreviateFrom,
    maximumSignificantDigits: significantDigits,
    useGrouping,
  })
}

export function addMovingAverages<T>(
  data: T[],
  getValue: (item: T) => number,
  getTimestamp: (item: T) => number,
  windowMs = 7 * TIME_FRAMES.DAY_MS,
) {
  if (data.length === 0) return []

  const totalAverage = meanBy(data, getValue)
  const averages = movingAverage(data.map(getValue), data.map(getTimestamp), windowMs)

  return data.map((item, i) => ({ ...item, movingAverage: averages[i], totalAverage }))
}
