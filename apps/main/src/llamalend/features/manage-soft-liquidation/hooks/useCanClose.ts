import BigNumber from 'bignumber.js'
import { useUserBalances, useUserState } from '@/llamalend/queries/user'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import type { UserMarketParams } from '@ui-kit/lib/model'
import type { Query } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'

const CLOSE_POSITION_SAFETY_BUFFER = 1.0001 // 0.01% safety margin

export type CanCloseData = { canClose: boolean; missing: Decimal; balance: Decimal }

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
 * @returns Query whose `data` contains both:
 * - `canClose`: whether current balances are sufficient to close
 * - `missing`: additional borrowed amount required to close
 */
export function useCanClose(params: UserMarketParams<LlamaChainId>): Query<CanCloseData> {
  const { data: userBalancesData, error: userBalancesError, isLoading: userBalancesLoading } = useUserBalances(params)
  const { data: userStateData, error: userStateError, isLoading: userStateLoading } = useUserState(params)
  const { debt, stablecoin } = userStateData ?? {}
  const { borrowed } = userBalancesData ?? {}

  const missing =
    debt &&
    stablecoin &&
    borrowed &&
    decimal(BigNumber.max(0, new BigNumber(debt).minus(stablecoin).times(CLOSE_POSITION_SAFETY_BUFFER).minus(borrowed)))

  return {
    data: missing && { canClose: +missing === 0, missing, balance: borrowed },
    isLoading: userBalancesLoading || userStateLoading,
    error: userBalancesError || userStateError,
  }
}
