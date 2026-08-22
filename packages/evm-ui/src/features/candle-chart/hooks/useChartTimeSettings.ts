import { useState } from 'react'
import { DEFAULT_TIME_OPTION } from '../constants'
import type { TimeOption } from '../types'

type TimeUnit = 'minute' | 'hour' | 'day'

type UseChartTimeSettingsReturn = {
  /** Currently selected time option */
  timeOption: TimeOption
  /** Update the selected time option */
  setTimeOption: (timeOption: TimeOption) => void
  /** Interval value for the API (e.g., 15 for 15m, 1 for 1h) */
  chartInterval: number
  /** Time unit for the API ('minute' | 'hour' | 'day') */
  timeUnit: TimeUnit
}

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

const timeUnits: Record<TimeOption, TimeUnit> = {
  '15m': 'minute',
  '30m': 'minute',
  '1h': 'hour',
  '4h': 'hour',
  '6h': 'hour',
  '12h': 'hour',
  '1d': 'day',
  '7d': 'day',
  '14d': 'day',
}

/**
 * Manages chart time option state and converts it into the parameters needed for chart API requests.
 * Time settings only recalculate when timeOption changes.
 */
export const useChartTimeSettings = (
  initialTimeOption: TimeOption = DEFAULT_TIME_OPTION,
): UseChartTimeSettingsReturn => {
  const [timeOption, setTimeOption] = useState<TimeOption>(initialTimeOption)

  return {
    timeOption,
    setTimeOption,
    chartInterval: intervals[timeOption],
    timeUnit: timeUnits[timeOption],
  }
}
