import { meanBy } from 'lodash'
import { movingAverage } from '@primitives/array.utils'
import { TIME_FRAMES } from '@ui-kit/lib/model/time'

export type ChartLineDashPattern = number[]

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
