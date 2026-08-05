import { TIME_FRAMES } from '@ui-kit/lib/model/time'

type TimeRange = { start: number; end: number }

const ONE_DAY_IN_SECONDS = TIME_FRAMES.DAY_MS / 1000

// Snapshot endpoints return at most 100 rows per request. A 99-day inclusive range
// therefore contains at most 100 daily buckets.
const MAX_SNAPSHOT_RANGE_DAYS = 99

export const getTimeRange = (days: number, end = Math.floor(Date.now() / 1000)): TimeRange => ({
  start: end - days * ONE_DAY_IN_SECONDS,
  end,
})

const getTimeRangeChunks = ({ start, end }: TimeRange, maxDays: number): TimeRange[] => {
  if (end < start) throw new Error('Time range end must be greater than or equal to its start')
  if (maxDays <= 0) throw new Error('Time range chunk size must be greater than zero')

  const chunkSize = maxDays * ONE_DAY_IN_SECONDS
  const chunkCount = Math.max(1, Math.ceil((end - start) / chunkSize))

  return Array.from({ length: chunkCount }, (_, index) => {
    const chunkStart = start + index * chunkSize
    return {
      start: chunkStart,
      end: index === chunkCount - 1 ? end : chunkStart + chunkSize - 1,
    }
  })
}

/**
 * Fetches all chunks atomically and returns one timestamp-deduplicated series in the requested order.
 */
export async function fetchChunkedTimeSeries<T extends { timestamp: number }>({
  range,
  maxDays,
  order,
  fetchChunk,
}: {
  range: TimeRange
  maxDays: number
  order: 'asc' | 'desc'
  fetchChunk: (range: TimeRange, isLatest: boolean) => Promise<T[]>
}) {
  const ranges = getTimeRangeChunks(range, maxDays)
  const chunks = await Promise.all(ranges.map((range, index) => fetchChunk(range, index === ranges.length - 1)))
  const deduplicated = new Map(chunks.flat().map(item => [item.timestamp, item])).values()
  const direction = order === 'asc' ? 1 : -1

  return Array.from(deduplicated).toSorted((a, b) => direction * (a.timestamp - b.timestamp))
}

/**
 * Fetches a complete daily snapshot range from the single-request API wrapper.
 * Only the newest chunk may include a live on-chain snapshot.
 */
export const fetchDailySnapshotHistory = async <T extends { timestamp: number }>({
  range,
  fetchSnapshots,
}: {
  range: TimeRange
  fetchSnapshots: (range: TimeRange, fetchOnChain: boolean) => Promise<T[]>
}) => {
  const snapshots = await fetchChunkedTimeSeries({
    range,
    maxDays: MAX_SNAPSHOT_RANGE_DAYS,
    order: 'desc',
    fetchChunk: fetchSnapshots,
  })

  return snapshots
}
