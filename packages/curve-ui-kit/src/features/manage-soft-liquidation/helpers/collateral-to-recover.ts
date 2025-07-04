import type { ClosePositionProps } from '..'
import { getTokens } from '../helpers/market'
import { UserState as UserStateMain, type Market } from '../types'

type UserState = Pick<UserStateMain, 'collateral' | 'stablecoin' | 'debt'>

type Props = {
  market: Market | null
  userState?: UserState
}

/**
 * Calculates the recoverable collateral when closing a position
 *
 * This function determines what assets a user can recover when closing their position:
 * 1. Any remaining collateral tokens after position closure
 * 2. Excess stablecoin (if stablecoin balance exceeds outstanding debt)
 *
 * @returns Array of recoverable token objects
 */
export function getCollateralToRecover({ market, userState }: Props): ClosePositionProps['collateralToRecover'] {
  const { collateral, debt, stablecoin } = userState ?? {}
  const { stablecoin: stablecoinToken, collateral: collateralToken } = (market && getTokens(market)) || {}

  const result = []

  // Add collateral tokens if user has any remaining after position closure
  const collateralBalance = (collateral && parseFloat(collateral)) || 0
  if (collateral && collateralToken && collateralBalance > 0) {
    result.push({
      symbol: collateralToken.symbol,
      address: collateralToken.address,
      balance: collateralBalance,
      usd: 0, // TODO
    })
  }

  // Add excess stablecoin (stablecoin balance minus outstanding debt) if positive
  const stablecoinBalance = (stablecoin && debt && parseFloat(stablecoin) - parseFloat(debt)) || 0
  if (stablecoin && stablecoinToken && stablecoinBalance > 0) {
    result.push({
      symbol: stablecoinToken.symbol,
      address: stablecoinToken.address,
      balance: stablecoinBalance,
      usd: stablecoinBalance,
    })
  }

  return result
}
