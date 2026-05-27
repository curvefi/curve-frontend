import { TIME_OPTION_MS } from '@ui-kit/lib/model/time'
import type { TimeOption } from './types'

export const CANDLE_CHART_MAX_RESULTS = 300
export const CANDLE_CHART_PAGE_INTERVALS = CANDLE_CHART_MAX_RESULTS - 1

const getTimeOptionSeconds = (timeOption: TimeOption) => TIME_OPTION_MS[timeOption] / 1000

export const hasFullOhlcPage = (resultCount: number) => resultCount >= CANDLE_CHART_MAX_RESULTS

export const getOhlcPageStart = (timeOption: TimeOption, end: number) =>
  Math.floor(end - CANDLE_CHART_PAGE_INTERVALS * getTimeOptionSeconds(timeOption))

export const getPreviousOhlcPageEnd = (timeOption: TimeOption, pageStart: number) =>
  pageStart - getTimeOptionSeconds(timeOption)
