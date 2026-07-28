import { fetchChunkedTimeSeries, type TimeRange } from '@curvefi/prices-api/timestamp'

// Snapshot endpoints return at most 100 rows per request. A 99-day inclusive range
// contains at most 100 daily buckets.
const MAX_SNAPSHOT_RANGE_DAYS = 99

/**
 * Fetches a complete daily snapshot range from the single-request API wrapper.
 * Only the newest chunk may include a live on-chain snapshot.
 */
export const fetchDailySnapshotHistory = async <T extends { timestamp: number }>({
  range,
  fetchOnChain,
  fetchSnapshots,
}: {
  range: TimeRange
  fetchOnChain: boolean
  fetchSnapshots: (range: TimeRange, fetchOnChain: boolean) => Promise<T[]>
}) => {
  const snapshots = await fetchChunkedTimeSeries({
    range,
    maxDays: MAX_SNAPSHOT_RANGE_DAYS,
    order: 'desc',
    fetchChunk: (range, isLatest) => fetchSnapshots(range, fetchOnChain && isLatest),
  })

  return snapshots
}
