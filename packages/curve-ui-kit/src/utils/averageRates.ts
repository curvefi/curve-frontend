import lodash from 'lodash'
import { Duration } from '@ui-kit/themes/design/0_primitives'

const { Weekly, Monthly } = Duration.AverageRates

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
  week: { window: Weekly, period: `${Weekly}D`, adjective: 'weekly' },
  month: { window: Monthly, period: `${Monthly}D`, adjective: 'monthly' },
} satisfies Record<string, AverageType>

export const AVERAGES_TYPES = {
  week,
  month,
} as const
