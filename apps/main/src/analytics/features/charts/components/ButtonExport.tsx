import { llama } from '@/analytics/llamadash'
import { IconButton } from '@mui/material'
import { DownloadIcon } from '@ui-kit/shared/icons/DownloadIcon'

/** Plain series data keyed by column name. `time` is a UTC timestamp. */
type SeriesData = Record<string, { time: number; value: number }[]>

/**
 * Builds CSV content from series data.
 * @remarks Values are not escaped for the delimiter,
 * it's not expected to be part of an actual value.
 */
function createCsvData(data: SeriesData): string {
  const columns = llama(Object.keys(data)).orderBy(x => x)

  const rows = columns
    .flatMap(column =>
      data[column].map(point => ({
        column,
        time: Math.floor(point.time / 1000), // Convert ms to UTC seconds
        value: point.value,
      })),
    )
    .groupBy(x => x.time)
    .entries()
    .orderBy(([time]) => Number(time))
    .map(([time, points]) => {
      const xs = llama(points)
        .orderBy(x => x.column)
        .map(x => x.value)
        .value()
        .join(';')

      return `${time};${xs}`
    })
    .value()

  return ['time;' + columns.value().join(';'), ...rows].join('\n')
}

function triggerDownload(filename: string, csvContent: string) {
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
}

/**
 * Button component that exports chart data as CSV.
 *
 * @example
 * <ButtonExport
 *   filename="crvusd_supply"
 *   data={{ supply: [{ time: 1625097600000, value: 1000 }], borrowed: [...] }}
 * />
 */
export const ButtonExport = ({
  filename,
  data,
  fullscreen,
}: {
  filename: string
  data: SeriesData
  fullscreen: boolean
}) => (
  <IconButton onClick={() => triggerDownload(filename, createCsvData(data))} size={fullscreen ? 'small' : 'extraSmall'}>
    <DownloadIcon />
  </IconButton>
)
