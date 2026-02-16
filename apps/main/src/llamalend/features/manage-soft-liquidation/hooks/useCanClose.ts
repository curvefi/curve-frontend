import { useConnection } from 'wagmi'
import { useUserBalances, useUserState } from '@/llamalend/queries/user'
import { decimal } from '@ui-kit/utils'
import type { ClosePositionProps } from '..'
import type { MarketParams } from '../types'

const CLOSE_POSITION_SAFETY_BUFFER = 1.0001 // 0.01% safety margin

/**
 * Determines if a user can close their position and calculates how much
 * additional borrowed stablecoin is required. Applies a safety buffer
 * to account for potential contract execution edge cases where exact balance
 * matching might fail due to rounding or state changes between transaction
 * submission and execution.
 *
 * The calculation is: (debt - stablecoin) * CLOSE_POSITION_SAFETY_BUFFER - borrowed
 * where:
 * - debt: Total amount owed
 * - stablecoin: User's stablecoin balance already present in the AMM
 * - borrowed: User's borrowed token balance
 *
 * @returns Object containing missing amount of borrowed tokens needed to close
 * @example
 * ```typescript
 * const { missing } = useCanClose({ chainId: 1, marketId: 'market-1' })
 * // With debt=100, stablecoin=50, borrowed=40:
 * // missing: '10.005' (50.005 required - 40 borrowed)
 * ```
 */
export function useCanClose(params: MarketParams): ClosePositionProps['canClose'] {
  const { address: userAddress } = useConnection()
  const { data: userBalances } = useUserBalances({ ...params, userAddress })
  const { data: userState } = useUserState({ ...params, userAddress })

  const { debt = '0', stablecoin = '0' } = userState ?? {}
  const { borrowed = '0' } = userBalances ?? {}

  const requiredToClose = (+debt - +stablecoin) * CLOSE_POSITION_SAFETY_BUFFER
  const missing = Math.max(0, requiredToClose - +borrowed)

  return { missing: decimal(missing) }
}
