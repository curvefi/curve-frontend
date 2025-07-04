import type { ClosePositionProps } from '..'
import type { UserState, UserBalances } from '../types'

type Props = {
  userState: Pick<UserState, 'debt' | 'stablecoin'> | undefined
  userBalances: UserBalances | undefined
}

/**
 * Determines if a user can close their position and how much additional
 * stablecoin is required. Applies a 0.01% safety buffer to account for
 * potential contract execution edge cases where exact balance matching
 * might fail due to rounding or state changes between transaction
 * submission and execution.
 *
 * @returns Object containing required amount to close and missing amount
 * @example
 * ```typescript
 * const result = canClose({
 *   userState: { debt: '100', stablecoin: '50' },
 *   userBalances: { stablecoin: '60' }
 * })
 * // result: { requiredToClose: 50.005, missing: 9.995 }
 * ```
 */
export function checkCanClose({ userState, userBalances }: Props): ClosePositionProps['canClose'] {
  const { debt = '0', stablecoin = '0' } = userState ?? {}
  const { stablecoin: stablecoinBalance = '0' } = userBalances ?? {}

  const requiredToClose = (parseFloat(debt) - parseFloat(stablecoin)) * 1.0001
  const missing = Math.max(0, requiredToClose - parseFloat(stablecoinBalance))

  return { requiredToClose, missing }
}
