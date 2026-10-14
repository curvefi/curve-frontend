import { useMemo, useState } from 'react'
import type { UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import {
  canRepayFromStateCollateral,
  hasZapV2,
  isPositionLeveraged,
  type MarketToken,
  type MarketTokensOrEmpty,
} from '@/llamalend/llama.utils'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import { notFalsy } from '@primitives/objects.utils'
import type { QueryProp } from '@ui/features/queries/util'
import type { TokenOption } from '@ui/features/select-token/types'
import { useMarketContext } from '../../market-context'

export type RepayTokenOption = TokenOption & { field: 'stateCollateral' | 'userBorrowed' }

/**
 * Get token options for repayment based on market and network
 */
const getRepayTokenOptions = ({
  borrowToken,
  collateralToken,
  blockchainId,
  market,
  hasLeverageProvider,
}: {
  borrowToken: MarketToken | undefined
  collateralToken: MarketToken | undefined
  blockchainId: string
  market: MarketTemplate | undefined
  hasLeverageProvider: boolean
}) =>
  notFalsy<RepayTokenOption>(
    borrowToken && {
      address: borrowToken.address,
      chain: blockchainId,
      symbol: borrowToken.symbol,
      field: 'userBorrowed',
    },
    collateralToken &&
      canRepayFromStateCollateral(market) &&
      (!hasZapV2(market) || hasLeverageProvider) && {
        address: collateralToken.address,
        chain: blockchainId,
        symbol: collateralToken.symbol,
        field: 'stateCollateral',
      },
  )

/**
 * Hook that returns repay token options, containing the logic to select between different repayment sources
 */
export const useRepayTokens = ({
  tokens: { borrowToken, collateralToken },
  blockchainId,
  collateralEvents,
}: {
  tokens: MarketTokensOrEmpty
  blockchainId: string
  collateralEvents: QueryProp<UserCollateralEvents>
}) => {
  const { market, leverageProviders } = useMarketContext()
  const tokens = useMemo(
    () =>
      getRepayTokenOptions({
        borrowToken,
        collateralToken,
        blockchainId,
        market,
        hasLeverageProvider: !!leverageProviders?.length,
      }),
    [borrowToken, collateralToken, blockchainId, market, leverageProviders?.length],
  )
  const isLeveraged = collateralEvents.data && isPositionLeveraged(collateralEvents.data?.originalLeverage)
  const field = isLeveraged === true ? 'stateCollateral' : isLeveraged === false ? 'userBorrowed' : undefined
  const defaultToken = tokens.find(t => t.field === field)
  const [token, setToken] = useState(defaultToken)
  const [previousDefaultToken, setPreviousDefaultToken] = useState(defaultToken)
  if (!Object.is(previousDefaultToken, defaultToken)) {
    setPreviousDefaultToken(defaultToken)
    // override the user's choice when we get to know they have a (non)-leveraged position
    if (defaultToken) setToken(defaultToken)
  }
  // Market or provider changes can remove a repayment source, so keep the selection within the current options.
  const selectedToken = tokens.find(({ field }) => field === token?.field) ?? tokens[0]
  return { tokens, token: selectedToken, onToken: setToken }
}
