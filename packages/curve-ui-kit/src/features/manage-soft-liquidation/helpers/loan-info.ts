import type { ActionInfosProps } from '..'
import { UserState as UserStateMain, type LoanParameters, type Market } from '../types'
import { parseFloatOptional } from './float'
import { getTokens } from './market'

type UserState = Pick<UserStateMain, 'collateral' | 'stablecoin' | 'debt'>

type Props = {
  market: Market | null
  loanParameters?: LoanParameters
  userState?: UserState
}

export function getLoanInfo({ market, loanParameters, userState }: Props): ActionInfosProps['loan'] {
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
    ltv: { current: 45.23, next: 24.15 },
    collateral: [
      { symbol: 'ETH', amount: 7.52 },
      { symbol: 'crvUSD', amount: 2457 },
    ],
  }
}
