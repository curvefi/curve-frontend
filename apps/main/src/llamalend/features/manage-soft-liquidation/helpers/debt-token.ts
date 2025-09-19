import { getTokens } from '@/llamalend/llama.utils'
import type { ClosePositionProps } from '..'
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
  const { borrowToken } = (market && getTokens(market)) || {}

  if (!borrowToken || !borrowToken.address || debt == null) {
    return undefined
  }

  return {
    symbol: borrowToken.symbol,
    address: borrowToken.address,
    amount: parseFloat(debt),
  }
}
