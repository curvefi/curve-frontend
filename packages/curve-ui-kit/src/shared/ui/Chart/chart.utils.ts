import { meanBy } from 'lodash'
import { movingAverage } from '@primitives/array.utils'
import { TIME_FRAMES } from '@ui-kit/lib/model/time'

export type ChartLineDashPattern = number[]

export const CHART_LINE_DASH_PATTERNS = {
  movingAverage: [2, 2],
  compact: [4, 2],
  average: [4, 4],
  alternateSeries: [8, 8],
  reference: [8, 4],
} satisfies Record<string, ChartLineDashPattern>

export const CHART_REFERENCE_LINE_WIDTH = 2

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
