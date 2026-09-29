import type { ChipColors } from '@ui/features/themes/components/chip/colors'
import type { PositionSeverity } from './position-status.utils'

export const STATUS_BADGE_COLOR: Record<PositionSeverity, ChipColors> = {
  near: 'warning',
  inRange: 'warning',
  below: 'warning',
  liquidatable: 'alert',
  neutral: 'default',
}
