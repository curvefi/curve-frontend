import { describe, expect, it } from 'vitest'
import {
  CANDLE_CHART_MAX_RESULTS,
  CANDLE_CHART_PAGE_INTERVALS,
  getOhlcPageStart,
  getPreviousOhlcPageEnd,
  hasFullOhlcPage,
} from './time-utils'

describe('candle chart time utils', () => {
  it('calculates a 300-point OHLC page start from the selected interval and end timestamp', () => {
    expect(getOhlcPageStart('1d', 1_700_000_000)).toBe(1_674_166_400)
    expect(CANDLE_CHART_PAGE_INTERVALS).toBe(299)
  })

  it('calculates the previous OHLC page end with a one-interval gap', () => {
    expect(getPreviousOhlcPageEnd('1h', 1_698_923_600)).toBe(1_698_920_000)
  })

  it('detects a full OHLC page from the API max result count', () => {
    expect(hasFullOhlcPage(CANDLE_CHART_MAX_RESULTS - 1)).toBe(false)
    expect(hasFullOhlcPage(CANDLE_CHART_MAX_RESULTS)).toBe(true)
  })
})
