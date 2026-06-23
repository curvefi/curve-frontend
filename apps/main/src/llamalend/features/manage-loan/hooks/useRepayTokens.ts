import { useEffect, useMemo, useState } from 'react'
import type { UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { type MarketTokens, isPositionLeveraged } from '@/llamalend/llama.utils'
import { notFalsy } from '@primitives/objects.utils'
import type { TokenOption } from '@ui-kit/features/select-token'
import type { QueryProp } from '@ui-kit/types/util'

export type RepayTokenOption = TokenOption & { field: 'stateCollateral' | 'userCollateral' | 'userBorrowed' }

/**
 * Get token options for repayment based on market and network
 */
const getRepayTokenOptions = ({
  tokens: { borrowToken, collateralToken },
  networkId,
  canRepayFromStateCollateral,
  canRepayFromUserCollateral,
}: {
  tokens: Partial<MarketTokens>
  networkId: string
  canRepayFromStateCollateral: boolean
  canRepayFromUserCollateral: boolean
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
  tokens,
  networkId,
  canRepayFromStateCollateral,
  canRepayFromUserCollateral,
  collateralEvents,
}: {
  tokens: Partial<MarketTokens>
  networkId: string
  canRepayFromStateCollateral: boolean
  canRepayFromUserCollateral: boolean
  collateralEvents: QueryProp<UserCollateralEvents>
}) => {
  const [token, setToken] = useState<RepayTokenOption | undefined>()
  const repayTokens = useMemo(
    () => getRepayTokenOptions({ tokens, networkId, canRepayFromStateCollateral, canRepayFromUserCollateral }),
    [canRepayFromStateCollateral, canRepayFromUserCollateral, networkId, tokens],
  )
  const isLeveraged = collateralEvents.data && isPositionLeveraged(collateralEvents.data?.originalLeverage)
  const field = isLeveraged === true ? 'stateCollateral' : isLeveraged === false ? 'userBorrowed' : undefined
  const defaultToken = repayTokens.find(t => t.field === field)
  useEffect(() => {
    // override the user's choice when we get to know they have a (non)-leveraged position
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
    if (defaultToken) setToken(defaultToken)
  }, [defaultToken])
  return { tokens: repayTokens, token: token ?? repayTokens[0], onToken: setToken }
}
