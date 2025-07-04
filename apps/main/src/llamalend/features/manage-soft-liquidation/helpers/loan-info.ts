import type { ActionInfosProps } from '..'
import type { LoanParameters, Market, UserState } from '../types'
import type { getCollateralToRecover } from './collateral-to-recover'
import { parseFloatOptional } from './float'
import { getTokens } from './market'

type Props = {
  market: Market | undefined
  loanParameters: LoanParameters | undefined
  userState: Pick<UserState, 'collateral' | 'stablecoin' | 'debt'> | undefined
  collateralToRecover: ReturnType<typeof getCollateralToRecover> | undefined
}

export function getLoanInfo({
  market,
  loanParameters,
  userState,
  collateralToRecover,
}: Props): ActionInfosProps['loan'] {
  const { stablecoin } = userState ?? {}
  const amount = parseFloatOptional(stablecoin)
  const { symbol } = (market && getTokens(market))?.stablecoin || {}
  const debt = (amount && symbol && { symbol, amount }) || undefined

  const borrowRate = loanParameters
    ? {
        current: parseFloat(loanParameters.rate),
        next: parseFloatOptional(loanParameters.future_rate),
      }
    : undefined

  return {
    borrowRate,
    debt,
    ltv: undefined, // I don't know yet how to determine it so it's not available for now
    collateral: (collateralToRecover ?? []).filter(
      (item): item is typeof item & { amount: number } => item.amount != null && item.amount > 0,
    ),
  }
}
