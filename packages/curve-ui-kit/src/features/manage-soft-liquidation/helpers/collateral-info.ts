import type { ActionInfosProps } from '..'
import { UserLoanDetails as UserLoanDetailsMain, UserState as UserStateMain, type Market } from '../types'
import { getCollateralToRecover } from './collateral-to-recover'
import { parseFloatOptional } from './float'
import { getTokens } from './market'

type UserState = Pick<UserStateMain, 'collateral' | 'stablecoin' | 'debt'>
type UserLoanDetails = Pick<UserLoanDetailsMain, 'healthFull'>

type Props = {
  market: Market | null
  userLoanDetails?: UserLoanDetails
  userState?: UserState
}

export function getCollateralInfo({ market, userLoanDetails, userState }: Props): ActionInfosProps['collateral'] {
  const { collateral } = userState ?? {}
  const amount = parseFloatOptional(collateral)
  const { symbol } = (market && getTokens(market))?.collateral || {}
  const borrowed = (amount && symbol && { symbol, amount }) || undefined

  const collateralToRecover = getCollateralToRecover({ market, userState })

  return {
    borrowed,
    leverage: { current: 9.0, next: 10.1 },
    assetsToWithdraw: (collateralToRecover ?? []).filter(
      (item): item is typeof item & { amount: number } => item.amount != null && item.amount > 0,
    ),
  }
}
