import { useCallback, useMemo, useState } from 'react'
import { DEFAULT_TIME_OPTION } from '../constants'
import type { TimeOption } from '../types'
import { getThreeHundredResultsAgo } from '../utils'

type ChartTimeSettings = {
  /** Start timestamp for fetching chart data */
  start: number
  /** End timestamp (current time) */
  end: number
}

type UseChartTimeSettingsReturn = {
  /** Currently selected time option */
  timeOption: TimeOption
  /** Update the selected time option */
  setTimeOption: (timeOption: TimeOption) => void
  /** Time range for fetching chart data */
  chartTimeSettings: ChartTimeSettings
  /** Interval value for the API (e.g., 15 for 15m, 1 for 1h) */
  chartInterval: number
  /** Time unit for the API ('minute' | 'hour' | 'day') */
  timeUnit: 'minute' | 'hour' | 'day'
}

/**
 * Manages chart time option state and converts it into the parameters needed for chart API requests.
 * Time settings only recalculate when timeOption changes.
 */
export const useChartTimeSettings = (
  initialTimeOption: TimeOption = DEFAULT_TIME_OPTION,
): UseChartTimeSettingsReturn => {
  const [timeOption, setTimeOptionState] = useState<TimeOption>(initialTimeOption)

  const setTimeOption = useCallback((option: TimeOption) => {
    setTimeOptionState(option)
  }, [])

  const chartTimeSettings = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity -- Date.now() is intentionally called once per timeOption change
    const now = Date.now() / 1000
    const threeHundredResultsAgo = getThreeHundredResultsAgo(timeOption, now)
    return {
      start: +threeHundredResultsAgo,
      end: Math.floor(now),
    }
  }, [timeOption])

  const chartInterval = useMemo(() => {
    const intervals: Record<TimeOption, number> = {
      '15m': 15,
      '30m': 30,
      '1h': 1,
      '4h': 4,
      '6h': 6,
      '12h': 12,
      '1d': 1,
      '7d': 7,
      '14d': 14,
    }
    return intervals[timeOption]
  }, [timeOption])

  const timeUnit = useMemo((): 'minute' | 'hour' | 'day' => {
    if (timeOption === '15m' || timeOption === '30m') return 'minute'
    if (timeOption === '1h' || timeOption === '4h' || timeOption === '6h' || timeOption === '12h') return 'hour'
    return 'day'
  }, [timeOption])

  return { timeOption, setTimeOption, chartTimeSettings, chartInterval, timeUnit }
}
