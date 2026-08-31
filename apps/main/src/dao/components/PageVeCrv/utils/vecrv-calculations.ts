import { requireLib } from '@evm-ui/features/connect-wallet'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, maybes } from '@primitives/objects.utils'

export const calcUnlockTime = ({ days, unlockTime }: { days: number | undefined; unlockTime?: number }) =>
  maybe(days, days => (days ? requireLib('curveApi').boosting.calcUnlockTime(days, unlockTime) : undefined))

export const calculateVeCrv = ({
  lockedAmount,
  unlockTime,
}: {
  lockedAmount: Decimal | undefined
  unlockTime: number | undefined
}) =>
  maybes([lockedAmount, unlockTime], (lockedAmount, unlockTime) =>
    requireLib('curveApi').boosting.calculateVeCrv(lockedAmount, unlockTime),
  )
