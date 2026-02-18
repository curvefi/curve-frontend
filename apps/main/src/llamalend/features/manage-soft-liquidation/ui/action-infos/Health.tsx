import { type ActionInfoProps, ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { HEALTH_THRESHOLDS } from '@/llamalend/features/market-position-details'
import type { Delta, TextColor } from './types'
import { formatValue } from './util'

/**
 * Determines the color for displaying new health values based on comparison with old values.
 *
 * @param health - Health object containing old value and optional new value
 * @returns Typography color:
 *   - 'textPrimary' if new value is null/undefined or zero
 *   - 'error' if new value is less than old value (health decreased)
 *   - 'success' if new value is greater than or equal to old value (health improved/maintained)
 */
const newHealthColor = ({ current, next }: Props): TextColor =>
  next == null || next === 0 ? 'textPrimary' : next < current ? 'error' : 'success'

/** Health color when not changing it */
const healthColor = (current: number): TextColor =>
  current <= HEALTH_THRESHOLDS.TEXT_SPLIT ? 'error' : current <= HEALTH_THRESHOLDS.RISKY ? 'warning' : 'success'

export type Props = Delta & Partial<ActionInfoProps>

/**
 * Health display logic for the accordion title.
 * A health below 0% means the user is subject to being hard-liquidated (not a guarantee!).
 * Shows current health value with appropriate color coding:
 * - When health is changing (new value exists): displays new value with comparison colors
 * - When health is static: displays current value with standard health color thresholds
 *
 * Note: Health change colors indicate direction of change rather than absolute health status.
 * A decrease from 150% to 140% shows as red (worse) even though 140% is still healthy.
 * This is subject to change if it turns out to be bad UX.
 */
export const Health = ({ current, next, ...actionInfoProps }: Props) => (
  <ActionInfo
    label="Health"
    value={`${formatValue(next ?? current)}%`}
    valueColor={next != null ? newHealthColor({ current, next }) : healthColor(current)}
    {...(next != null && {
      prevValue: `${formatValue(current)}%`,
      prevValueColor: 'textTertiary',
    })}
    sx={{ flexGrow: 1 }}
    {...actionInfoProps}
  />
)
