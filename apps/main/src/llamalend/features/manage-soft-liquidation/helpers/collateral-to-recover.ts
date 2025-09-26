import type { Address } from '@ui-kit/utils'
import type { ClosePositionProps } from '..'
import type { UserState } from '../types'

type Token = { symbol: string; address: Address; usdRate: number | undefined }

type Props = {
  stablecoinToken: Token | undefined
  collateralToken: Token | undefined
  userState: Pick<UserState, 'collateral' | 'stablecoin' | 'debt'> | undefined
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
export function getCollateralToRecover({
  stablecoinToken,
  collateralToken,
  userState,
}: Props): ClosePositionProps['collateralToRecover'] {
  const { collateral, debt, stablecoin } = userState ?? {}

  const result: ReturnType<typeof getCollateralToRecover> = []

  // Add collateral tokens if user has any remaining after position closure
  const collateralBalance = (collateral && parseFloat(collateral)) || 0
  if (collateral && collateralToken && collateralBalance > 0) {
    result.push({
      symbol: collateralToken.symbol,
      address: collateralToken.address,
      amount: collateralBalance,
      usd: collateralBalance * (collateralToken.usdRate ?? 0),
    })
  }

  // Add excess stablecoin (stablecoin balance minus outstanding debt) if positive
  const stablecoinBalance = (stablecoin && debt && parseFloat(stablecoin) - parseFloat(debt)) || 0
  if (stablecoin && stablecoinToken && stablecoinBalance > 0) {
    result.push({
      symbol: stablecoinToken.symbol,
      address: stablecoinToken.address,
      amount: stablecoinBalance,
      usd: stablecoinBalance * (stablecoinToken.usdRate ?? 0),
    })
  }

  return result
}
