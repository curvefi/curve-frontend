import type { PositionStatus } from '@/llamalend/health.utils'
import type { BadgeProps } from '@ui/components/Badge'
import { t } from '@ui/lib/i18n'

export const POSITION_STATUS_BADGE = {
  liquidatable: { label: t`Liquidatable`, color: 'alert' },
  inRange: { label: t`Soft liquidation`, color: 'warning' },
  belowRange: { label: t`Below range`, color: 'warning' },
  nearRange: { label: t`Near range`, color: 'warning' },
  aboveRange: { label: t`Above range`, color: 'default' },
} as const satisfies Record<PositionStatus, Pick<BadgeProps, 'label' | 'color'>>

export const POSITION_STATUS_DESCRIPTION: Record<PositionStatus, string[]> = {
  aboveRange: [t`The oracle price is above your liquidation range. No soft-liquidation conversions are occurring.`],
  nearRange: [
    t`The oracle price is close to your liquidation range. Soft liquidation starts once the price reaches it.`,
    t`Repay debt or add collateral to move your range further away.`,
  ],
  inRange: [
    t`The oracle price is inside your liquidation range. Your collateral is being converted to the borrowed token as the price goes down, and back as it goes up. These conversions incur losses that reduce your liquidation buffer.`,
    t`You cannot add collateral while in the range. Close your position to recover current collateral, or repay debt to keep it open.`,
    t`If your liquidation buffer falls below 0 while the price is in the range, your position can be hard-liquidated.`,
  ],
  belowRange: [
    t`The oracle price is below your liquidation range. Soft liquidation has converted your collateral to the borrowed token, and no losses occur while the price stays below the range.`,
    t`If the price comes back into your range, conversions resume and their losses reduce your liquidation buffer. Consider closing your position or repaying debt before that happens.`,
  ],
  liquidatable: [
    t`Your position can be hard-liquidated at any time, and all collateral would be lost.`,
    t`Repay debt and close immediately to recover remaining collateral.`,
  ],
}
