import { useEffect, useMemo, useState } from 'react'
import type { UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import {
  canRepayFromStateCollateral,
  canRepayFromUserCollateral,
  getTokens,
  isPositionLeveraged,
} from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { notFalsy } from '@primitives/objects.utils'
import type { TokenOption } from '@ui-kit/features/select-token'
import type { QueryProp } from '@ui-kit/types/util'

export type RepayTokenOption = TokenOption & { field: 'stateCollateral' | 'userCollateral' | 'userBorrowed' }

/**
 * Get token options for repayment based on market and network
 */
const getRepayTokenOptions = ({
  market,
  networkId,
}: {
  market: LlamaMarketTemplate | undefined
  networkId: string
}) => {
  const { borrowToken, collateralToken } = market ? getTokens(market) : {}
  return notFalsy<RepayTokenOption>(
    borrowToken && {
      address: borrowToken.address,
      chain: networkId,
      symbol: borrowToken.symbol,
      field: 'userBorrowed',
    },
    market &&
      collateralToken &&
      canRepayFromStateCollateral(market) && {
        address: collateralToken.address,
        chain: networkId,
        symbol: collateralToken.symbol,
        field: 'stateCollateral',
      },
    market &&
      collateralToken &&
      canRepayFromUserCollateral(market) && {
        address: collateralToken.address,
        chain: networkId,
        symbol: collateralToken.symbol,
        field: 'userCollateral',
      },
  )
}

/**
 * Hook that returns repay token options, containing the logic to select between different repayment sources
 */
export const useRepayTokens = ({
  market,
  networkId,
  collateralEvents,
}: {
  market: LlamaMarketTemplate | undefined
  networkId: string
  collateralEvents: QueryProp<UserCollateralEvents>
}) => {
  const [token, onToken] = useState<RepayTokenOption | undefined>()
  const tokens = useMemo(() => getRepayTokenOptions({ market, networkId }), [market, networkId])
  const leverageEnabled = collateralEvents.data && isPositionLeveraged(collateralEvents.data?.originalLeverage)
  const field = leverageEnabled === true ? 'stateCollateral' : leverageEnabled === false ? 'userBorrowed' : undefined
  const defaultToken = tokens.find((t) => t.field === field)
  useEffect(() => {
    // override the user's choice when we get to know they have a (non)-leveraged position
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (defaultToken) onToken(defaultToken)
  }, [defaultToken])
  return { tokens, token: token ?? tokens[0], onToken }
}
