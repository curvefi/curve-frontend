import { getEquityLeverage } from '@/llamalend/equity-leverage.utils'
import { useMarketContext } from '@/llamalend/features/market-context'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { hasZapV2 } from '@/llamalend/llama.utils'
import { useMarketOraclePrice } from '@/llamalend/queries/market/market-oracle-price.query'
import { type UserState, useUserState } from '@/llamalend/queries/user/user-state.query'
import type { UserMarketParams } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { DISABLED_Q, q, type QueryProp } from '@ui/features/queries/util'

export type EquityLeverage = { current: QueryProp<Decimal | null>; future: QueryProp<Decimal | null> }

/**
 * Equity leverage of the open position (current) and of the position after the action (future).
 * Returns null when it is not shown: disabled, or neither the open position nor the action borrows through the zap.
 */
export function useEquityLeverage(
  {
    params,
    futurePosition,
    leverageEnabled,
  }: {
    params: UserMarketParams
    futurePosition?: QueryProp<UserState | null>
    /** The action borrows with leverage, which goes through the zap when the market has one */
    leverageEnabled?: boolean
  },
  enabled: boolean,
): EquityLeverage | null {
  const { market, marketType, controllerAddress, chainId, userAddress, tokens } = useMarketContext()
  const { data: collateralEvents } = useUserCollateralEvents({
    app: marketType,
    controllerAddress,
    chainId,
    userAddress,
    tokens,
  })
  const oraclePrice = q(useMarketOraclePrice(params, enabled))
  const current = combineQueries([q(useUserState(params, enabled)), oraclePrice], getEquityLeverage)
  const future = combineQueries(
    [futurePosition ?? DISABLED_Q, oraclePrice],
    (position, oraclePrice) => position && getEquityLeverage(position, oraclePrice),
  )
  const isZapBorrow = !!leverageEnabled && hasZapV2(market)
  return enabled && (isZapBorrow || collateralEvents?.isZapLeveraged) ? { current, future } : null
}
