import { meanBy } from 'lodash'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { TIME_FRAMES } from '@ui-kit/utils/time'

const { Weekly: WEEKLY, Monthly: MONTHLY } = Duration.AverageRates

/** A timestamped snapshot record */
export type WithTimestamp = { timestamp: string | number | Date }

export const AVERAGE_WINDOW_DAYS = {
  week: WEEKLY,
  month: MONTHLY,
  year: TIME_FRAMES.YEAR_MS / TIME_FRAMES.DAY_MS,
} as const

/**
 * Checks that timestamped data covers an entire trailing window.
 * A tolerance keeps daily aggregates eligible when their bucket timestamp is slightly inside the exact cutoff.
 */
export function hasFullTimeWindow(
  snapshots: WithTimestamp[] | undefined,
  daysBack: number,
  now = Date.now(),
  tolerance = TIME_FRAMES.DAY_MS,
) {
  const timestamps = (snapshots ?? []).map(snapshot => new Date(snapshot.timestamp).getTime()).filter(Number.isFinite)

  if (timestamps.length === 0) return false

  const cutoff = now - daysBack * TIME_FRAMES.DAY_MS
  return Math.min(...timestamps) <= cutoff + tolerance && Math.max(...timestamps) >= now - tolerance
}

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

  const recentSnapshots = snapshots.filter(snapshot => new Date(snapshot.timestamp) > cutoffDate)

  if (recentSnapshots.length === 0) return null

  // Calculate averages for each extractor
  const result = {} as { [P in keyof K]: number | null }

  for (const [key, extractor] of Object.entries(extractors)) {
    const average = meanBy(recentSnapshots, extractor)
    result[key as keyof K] = isNaN(average) ? null : average
  }

  return result
}

type AverageType = {
  /** Number of days included in the average window. */
  window: number
  /** Label for the period of the the averaging range. */
  period: string
  /** Adjective label for the averaging range. */
  adjective: string
}

const { week, month } = {
  week: { window: WEEKLY, period: `${WEEKLY}D`, adjective: 'weekly' },
  month: { window: MONTHLY, period: `${MONTHLY}D`, adjective: 'monthly' },
} satisfies Record<string, AverageType>

export const AVERAGES_TYPES = {
  week,
  month,
} as const
