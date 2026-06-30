import { useEffect, useMemo, useState } from 'react'
import type { UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import {
  canRepayFromStateCollateral,
  canRepayFromUserCollateral,
  isPositionLeveraged,
  type MarketToken,
  type MarketTokensOrEmpty,
} from '@/llamalend/llama.utils'
import { notFalsy } from '@primitives/objects.utils'
import type { TokenOption } from '@ui-kit/features/select-token'
import type { QueryProp } from '@ui-kit/types/util'
import { useMarketContext } from '../../market-context'

export type RepayTokenOption = TokenOption & { field: 'stateCollateral' | 'userCollateral' | 'userBorrowed' }

/**
 * Get token options for repayment based on market and network
 */
const getRepayTokenOptions = ({
  borrowToken,
  collateralToken,
  networkId,
  canRepayFromStateCollateral,
  canRepayFromUserCollateral,
}: {
  borrowToken: MarketToken | undefined
  collateralToken: MarketToken | undefined
  networkId: string
  canRepayFromStateCollateral: boolean | undefined
  canRepayFromUserCollateral: boolean | undefined
}) =>
  notFalsy<RepayTokenOption>(
    borrowToken && {
      address: borrowToken.address,
      chain: networkId,
      symbol: borrowToken.symbol,
      field: 'userBorrowed',
    },
    collateralToken &&
      canRepayFromStateCollateral && {
        address: collateralToken.address,
        chain: networkId,
        symbol: collateralToken.symbol,
        field: 'stateCollateral',
      },
    collateralToken &&
      canRepayFromUserCollateral && {
        address: collateralToken.address,
        chain: networkId,
        symbol: collateralToken.symbol,
        field: 'userCollateral',
      },
  )

/**
 * Hook that returns repay token options, containing the logic to select between different repayment sources
 */
export const useRepayTokens = ({
  tokens: { borrowToken, collateralToken },
  networkId,
  collateralEvents,
}: {
  tokens: MarketTokensOrEmpty
  networkId: string
  collateralEvents: QueryProp<UserCollateralEvents>
}) => {
  const { market } = useMarketContext()
  const canRepayFromStateCollateralValue = market ? canRepayFromStateCollateral(market) : undefined
  const canRepayFromUserCollateralValue = market ? canRepayFromUserCollateral(market) : undefined
  const [token, setToken] = useState<RepayTokenOption | undefined>()
  const tokens = useMemo(
    () =>
      getRepayTokenOptions({
        borrowToken,
        collateralToken,
        networkId,
        canRepayFromStateCollateral: canRepayFromStateCollateralValue,
        canRepayFromUserCollateral: canRepayFromUserCollateralValue,
      }),
    [borrowToken, collateralToken, networkId, canRepayFromStateCollateralValue, canRepayFromUserCollateralValue],
  )
  const isLeveraged = collateralEvents.data && isPositionLeveraged(collateralEvents.data?.originalLeverage)
  const field = isLeveraged === true ? 'stateCollateral' : isLeveraged === false ? 'userBorrowed' : undefined
  const defaultToken = tokens.find(t => t.field === field)
  useEffect(() => {
    // override the user's choice when we get to know they have a (non)-leveraged position
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
    if (defaultToken) setToken(defaultToken)
  }, [defaultToken])
  return { tokens, token: token ?? tokens[0], onToken: setToken }
}
