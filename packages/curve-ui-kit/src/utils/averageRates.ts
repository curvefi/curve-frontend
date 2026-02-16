import lodash from 'lodash'
const { meanBy } = lodash

/** A timestamped snapshot record */
export type WithTimestamp = { timestamp: string | number | Date }

/**
 * Calculates average rates from snapshots over a given time period
 *
 * @param snapshots - Array of snapshot objects with timestamp
 * @param daysBack - Number of days to look back from today
 * @param extractors - Object where keys are result field names and values are functions to extract data from snapshots
 * @returns Object with averaged values or null if no data
 */
export function calculateAverageRates<
  T extends WithTimestamp,
  K extends Record<string, (snapshot: T) => number | null | undefined>,
>(snapshots: T[] | undefined, daysBack: number, extractors: K): { [P in keyof K]: number | null } | null {
  if (!snapshots) return null

  // Filter snapshots to only include recent ones
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysBack)

  const recentSnapshots = snapshots.filter((snapshot) => new Date(snapshot.timestamp) > cutoffDate)

  if (recentSnapshots.length === 0) return null

  // Calculate averages for each extractor
  const result = {} as { [P in keyof K]: number | null }

  for (const [key, extractor] of Object.entries(extractors)) {
    const average = meanBy(recentSnapshots, extractor)
    result[key as keyof K] = isNaN(average) ? null : average
  }

  return result
}
