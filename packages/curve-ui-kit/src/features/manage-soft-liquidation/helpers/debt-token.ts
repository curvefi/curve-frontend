import type { ClosePositionProps } from '..'
import { getTokens } from '../helpers/market'
import type { UserState, Market } from '../types'

type Props = {
  market: Market | undefined
  userState: Pick<UserState, 'debt'> | undefined
}

/**
 * Extracts debt token information for a user's position in a Llamma market.
 *
 * @returns Debt token object.
 */
export function getDebtToken({ market, userState }: Props): ClosePositionProps['debtToken'] {
  const { debt } = userState ?? {}
  const { stablecoin } = (market && getTokens(market)) || {}

  if (!stablecoin || !stablecoin.address || debt == null) {
    return undefined
  }

  return {
    symbol: stablecoin.symbol,
    address: stablecoin.address,
    amount: parseFloat(debt),
  }
}
