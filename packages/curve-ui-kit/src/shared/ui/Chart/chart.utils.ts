import { meanBy } from 'lodash'
import type { Theme } from '@mui/material/styles'
import { movingAverage } from '@primitives/array.utils'
import { TIME_FRAMES } from '@ui-kit/lib/model/time'
import { formatNumber, type NumberFormatOptions } from '@ui-kit/utils/number'

export type ChartLineDashPattern = number[]

export type ChartAxisTickLabelOptions = {
  showMinLabel?: boolean
  showMaxLabel?: boolean
}

export const DEFAULT_CHART_SIGNIFICANT_DIGITS = 5
const DEFAULT_CHART_ABBREVIATE_FROM = 10000
const CHART_COLOR_INDICES = [1, 2, 3, 4, 5, 6, 7, 8] as const

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

export const createChartSeriesColorScale = (theme: Theme) => CHART_COLOR_INDICES.map(i => theme.design.Chart.Lines[i])

export const createChartSeriesSurfaceColorScale = (theme: Theme) =>
  CHART_COLOR_INDICES.map(i => theme.design.Chart.Surfaces[i])

export const getChartSignedValueColor = (theme: Theme, value: number | bigint) =>
  (typeof value === 'bigint' ? value > 0n : value > 0)
    ? theme.design.Chart.Candles.Positive
    : theme.design.Chart.Candles.Negative

/**
 * Computes min/max axis bounds from chart values, optional reference lines, and proportional padding.
 * `includeZero` keeps single-sign charts anchored to zero, which is useful for bars where a non-zero baseline would
 * misrepresent magnitude, while still adding headroom on the data side.
 */
export const getPaddedChartAxisBounds = ({
  includeZero = false,
  paddingRatio,
  referenceValues = [],
  values,
}: {
  includeZero?: boolean
  paddingRatio: number
  referenceValues?: number[]
  values: number[]
}) => {
  const boundsValues = [...values, ...referenceValues, ...(includeZero ? [0] : [])]
  if (!boundsValues.length) return { min: 0, max: 0 }

  const min = Math.min(...boundsValues)
  const max = Math.max(...boundsValues)

  if (min === max) return { min: min - 1, max: max + 1 }

  const padding = (max - min) * paddingRatio

  return {
    min: includeZero && min >= 0 ? 0 : min - padding,
    max: includeZero && max <= 0 ? 0 : max + padding,
  }
}

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
