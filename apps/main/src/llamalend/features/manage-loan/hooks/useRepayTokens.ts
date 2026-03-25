import { useEffect, useMemo, useState } from 'react'
import { canRepayFromStateCollateral, canRepayFromUserCollateral, getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useIsLeveragedPosition } from '@/llamalend/queries/user/user-current-leverage.query'
import { notFalsy } from '@primitives/objects.utils'
import type { TokenOption } from '@ui-kit/features/select-token'

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
  chainId,
}: {
  market: LlamaMarketTemplate | undefined
  networkId: string
  chainId: number
}) => {
  const [token, onToken] = useState<RepayTokenOption | undefined>()
  const tokens = useMemo(() => getRepayTokenOptions({ market, networkId }), [market, networkId])
  const { data: leverageEnabled } = useIsLeveragedPosition({ chainId, marketId: market?.id })
  const field = leverageEnabled === true ? 'userCollateral' : leverageEnabled === false ? 'userBorrowed' : undefined
  const defaultToken = tokens.find((t) => t.field === field)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (defaultToken) onToken(defaultToken)
  }, [defaultToken])
  return { tokens, token: token ?? tokens[0], onToken }
}
