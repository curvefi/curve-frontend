import type { Time, UTCTimestamp } from 'lightweight-charts'
import { Download as DownloadIcon } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import type { SingleValueSerie } from '../types'

type Series = Record<string, SingleValueSerie | undefined>

/**
 * Converts various time formats from lightweight charts data to a UTC timestamp.
 *
 * @param time - The time to convert. Can be a number (UTC timestamp), string (ISO date), Date, or BusinessDay.
 * @returns UTCTimestamp - The converted UTC timestamp.
 * @throws Error if the time format is invalid.
 *
 * @example
 * toUTCTimestamp(1625097600) // Returns 1625097600
 * toUTCTimestamp('2021-07-01T00:00:00Z') // Returns 1625097600
 * toUTCTimestamp({ year: 2021, month: 7, day: 1 }) // Returns 1625097600
 */
function toUTCTimestamp(time: Time): UTCTimestamp {
  if (typeof time === 'number') {
    return time as UTCTimestamp
  }

  if (typeof time === 'string') {
    return Math.floor(new Date(time).getTime() / 1000) as UTCTimestamp
  }

  if (time instanceof Date) {
    return Math.floor(time.getTime() / 1000) as UTCTimestamp
  }

  // Handle BusinessDay format
  if (typeof time === 'object' && 'year' in time && 'month' in time && 'day' in time) {
    // BusinessDay months are 1-indexed, but Date months are 0-indexed
    const date = new Date(Date.UTC(time.year, time.month - 1, time.day))
    return Math.floor(date.getTime() / 1000) as UTCTimestamp
  }

  throw new Error('Invalid time format')
}

/**
 * Converts series data to an exportable format.
 *
 * @param series - Record of series, keyed by column name
 * @returns Array of objects containing column name and formatted data
 */
function createCsvData(series: Series) {
  const seriesData = Object.entries(series).map(([column, serie]) => ({
    column,
    data: (serie?.data() ?? []).map((data) => ({
      time: toUTCTimestamp(data.time),
      value: 'value' in data ? data.value : 0,
    })),
  }))

  const rows = seriesData
    .flatMap((serie) =>
      serie.data.map((data) => ({
        column: serie.column,
        data,
      })),
    )
    .groupBy((x) => x.data.time)
    .entries()
    .orderBy(([time]) => Number(time))
    .map(([time, points]) => {
      const xs = points
        .orderBy((x) => x.column)
        .map((x) => x.data.value)
        .join(';')

      return `${time};${xs}`
    })

  const headers = seriesData
    .map((x) => x.column)
    .orderBy((x) => x)
    .join(';')

  const csvContent = ['time;' + headers, ...rows].join('\n')

  return csvContent
}

/**
 * Button component that exports lightweight chart data as CSV
 *
 * @example
 * <ButtonChartExport
 *   filename="crvusd_supply"
 *   series={{ supply: supplySeries, debt: debtSeries }}
 * />
 */
export const ButtonChartExport = ({ filename, series }: { filename: string; series: Series }) => (
  <IconButton
    onClick={() => {
      const csvContent = createCsvData(series)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.csv`
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    }}
    size="small"
  >
    <DownloadIcon />
  </IconButton>
)
