import { useConnection } from 'wagmi'
import { getLlamaMarket, getTokens } from '@/llamalend/llama.utils'
import { useUserState } from '@/llamalend/queries/user'
import type { ActionInfosProps } from '..'
import type { MarketParams } from '../types'

/**
 * Retrieves and formats collateral information for a specific user's loan in a lending market.
 *
 * This hook fetches the user's current collateral state from the market and transforms it
 * into a format suitable for display in the action info panel.
 *
 * @returns An object containing collateral-related information:
 * - `borrowed`: An object with the collateral token symbol and amount if available, otherwise undefined
 * - `leverage`: Currently undefined as the calculation method is not yet implemented
 * - `assetsToWithdraw`: Currently undefined as its purpose/implementation is unclear
 */
export function useCollateralInfo(params: MarketParams): ActionInfosProps['collateral'] {
  const { address: userAddress } = useConnection()
  const { data: userState } = useUserState({ ...params, userAddress })

  const { collateral } = userState ?? {}

  const market = getLlamaMarket(params.marketId)
  const { symbol } = (market && getTokens(market))?.collateralToken || {}
  const borrowed = (collateral && symbol && { symbol, amount: +collateral }) || undefined

  return {
    borrowed,
    leverage: undefined, // I don't know yet how to determine it so it's not available for now
    assetsToWithdraw: undefined, // Not sure what the point is atm, same as 'collateral' action info in loan group?
  }
}
