import { TIME_OPTION_MS } from '@ui-kit/lib/model/time'
import type { TimeOption } from './types'

export type OhlcPageParam = {
  start: number
  end: number
}

export type OhlcPageResult = {
  hasMore: boolean
  oldestPageTimestamp?: number
}

const CANDLE_CHART_MAX_RESULTS = 300
const CANDLE_CHART_PAGE_INTERVALS = CANDLE_CHART_MAX_RESULTS - 1
const getTimeOptionSeconds = (timeOption: TimeOption) => TIME_OPTION_MS[timeOption] / 1000
// Prices API windows can be sparse. A short page can still have older history,
// so only an empty historical page should stop infinite pagination.
const hasHistoricalPageData = (resultCount: number) => resultCount > 0
const getOhlcPageStart = (timeOption: TimeOption, end: number) =>
  Math.floor(end - CANDLE_CHART_PAGE_INTERVALS * getTimeOptionSeconds(timeOption))
const getPreviousOhlcPageEnd = (timeOption: TimeOption, pageStart: number) =>
  pageStart - getTimeOptionSeconds(timeOption)

export const createOhlcPageParam = (timeOption: TimeOption, end: number): OhlcPageParam => ({
  start: getOhlcPageStart(timeOption, end),
  end,
})

export const getNextOhlcPageParam = (
  timeOption: TimeOption,
  lastPage: OhlcPageResult,
  lastPageParam: OhlcPageParam,
): OhlcPageParam | undefined => {
  if (!lastPage.hasMore) return undefined

  const oldestPageTimestamp = lastPage.oldestPageTimestamp ?? lastPageParam.start
  const end = getPreviousOhlcPageEnd(timeOption, oldestPageTimestamp)
  return createOhlcPageParam(timeOption, end)
}

export const createOhlcPageResult = (
  data: readonly { time: number }[],
  resultCount: number = data.length,
): OhlcPageResult => {
  const pageTimes = data.map(({ time }) => time)
  const oldestPageTimestamp = pageTimes.length > 0 ? Math.floor(Math.min(...pageTimes) / 1000) : undefined
  const hasMore = hasHistoricalPageData(resultCount)

  return {
    hasMore,
    oldestPageTimestamp,
  }
}

export const createCandleChartQueryKey = <TParts extends readonly unknown[]>(...parts: TParts) =>
  ['candle-chart', ...parts] as const
