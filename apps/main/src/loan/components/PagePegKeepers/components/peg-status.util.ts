import type { ChipColors } from '@ui-kit/themes/components/chip'
import type { PegKeeperDetails } from '../types'

export type PegStatus = {
  label: 'loading' | 'pegged' | 'overpegged' | 'underpegged' | 'error'
  color: ChipColors
}
/**
 * Determines the peg status based on the rate deviation from 1.0
 * @param rate - The current rate query
 * @returns PegStatus object with:
 *   - 'loading' if rate data is undefined
 *   - 'pegged' if within 2% tolerance (±0.02)
 *   - 'overpegged' if rate > 1.02 (above peg)
 *   - 'underpegged' if rate < 0.98 (below peg)
 *   Color severity: 'warning' if within 5% tolerance, 'alert' if beyond
 */
export function pegStatus({ data, isLoading, error }: PegKeeperDetails['rate']): PegStatus {
  if (isLoading) return { label: 'loading', color: 'unselected' }
  if (error) return { label: 'error', color: 'alert' }

  const delta = 1 - Number(data)
  const pegged = Math.abs(delta) <= 0.02
  const severe = Math.abs(delta) >= 0.05

  return pegged
    ? { label: 'pegged', color: 'active' }
    : { label: delta < 0 ? 'overpegged' : 'underpegged', color: severe ? 'alert' : 'warning' }
}
