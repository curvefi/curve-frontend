import { useEffect, useMemo, useState } from 'react'
import type { UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import {
  canRepayFromStateCollateral,
  canRepayFromUserCollateral,
  hasZapV2,
  isPositionLeveraged,
  type MarketToken,
  type MarketTokensOrEmpty,
} from '@/llamalend/llama.utils'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import type { TokenOption } from '@evm-ui/features/select-token'
import { notFalsy } from '@primitives/objects.utils'
import type { QueryProp } from '@ui/features/queries/util'
import { useMarketContext } from '../../market-context'

export type RepayTokenOption = TokenOption & { field: 'stateCollateral' | 'userCollateral' | 'userBorrowed' }

/**
 * Get token options for repayment based on market and network
 */
const getRepayTokenOptions = ({
  borrowToken,
  collateralToken,
  networkId,
  market,
  hasLeverageProvider,
}: {
  borrowToken: MarketToken | undefined
  collateralToken: MarketToken | undefined
  networkId: string
  market: MarketTemplate | undefined
  hasLeverageProvider: boolean
}) =>
  notFalsy<RepayTokenOption>(
    borrowToken && {
      address: borrowToken.address,
      chain: networkId,
      symbol: borrowToken.symbol,
      field: 'userBorrowed',
    },
    collateralToken &&
      canRepayFromStateCollateral(market) &&
      (!hasZapV2(market) || hasLeverageProvider) && {
        address: collateralToken.address,
        chain: networkId,
        symbol: collateralToken.symbol,
        field: 'stateCollateral',
      },
    collateralToken &&
      canRepayFromUserCollateral(market) &&
      hasLeverageProvider && {
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
  const { market, leverageProviders } = useMarketContext()
  const [token, setToken] = useState<RepayTokenOption | undefined>()
  const tokens = useMemo(
    () =>
      getRepayTokenOptions({
        borrowToken,
        collateralToken,
        networkId,
        market,
        hasLeverageProvider: !!leverageProviders?.length,
      }),
    [borrowToken, collateralToken, networkId, market, leverageProviders?.length],
  )
  const isLeveraged = collateralEvents.data && isPositionLeveraged(collateralEvents.data?.originalLeverage)
  const field = isLeveraged === true ? 'stateCollateral' : isLeveraged === false ? 'userBorrowed' : undefined
  const defaultToken = tokens.find(t => t.field === field)
  useEffect(() => {
    // override the user's choice when we get to know they have a (non)-leveraged position
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
    if (defaultToken) setToken(defaultToken)
  }, [defaultToken])
  // Market or provider changes can remove a repayment source, so keep the selection within the current options.
  const selectedToken = tokens.find(({ field }) => field === token?.field) ?? tokens[0]
  return { tokens, token: selectedToken, onToken: setToken }
}
