import { getEquity } from '@/llamalend/equity-leverage.utils'
import { useMarketContext } from '@/llamalend/features/market-context'
import { usePositionCapital } from '@/llamalend/features/user-position-history/queries/position-capital'
import { isZapV0MintMarket } from '@/llamalend/llama.utils'
import { getPositionPnlAndRoe, type PositionPnlAndRoe } from '@/llamalend/position-pnl.utils'
import { useMarketOraclePrice } from '@/llamalend/queries/market/market-oracle-price.query'
import { useUserState } from '@/llamalend/queries/user/user-state.query'
import { useLlamalendPositionPnl } from '@evm-ui/hooks/useFeatureFlags'
import type { UserMarketParams } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { DISABLED_Q, type QueryProp } from '@ui/features/queries/util'

export type PositionPnlAndEquityQueries = { equity: QueryProp<Decimal>; pnl: QueryProp<PositionPnlAndRoe | null> }

/** Equity and PNL of the open borrow position */
export function usePositionPnlAndEquity(params: UserMarketParams): PositionPnlAndEquityQueries | null {
  const isEnabled = useLlamalendPositionPnl()
  const { marketType, controllerAddress, blockchainId, userAddress } = useMarketContext()
  const position = useUserState(params, isEnabled)
  const oraclePrice = useMarketOraclePrice(params, isEnabled)
  // The prices API reports V0 zap leverage as plain borrows and repays, so their events can't give the position's capital
  const isPnlEnabled = isEnabled && !isZapV0MintMarket(blockchainId, controllerAddress)
  const capital = usePositionCapital(
    marketType,
    { blockchainId, contractAddress: controllerAddress, userAddress },
    isPnlEnabled,
  )
  const equity = combineQueries([position, oraclePrice], getEquity)
  // A disabled query still selects the events another query loaded, like the activity history
  const pnl = isPnlEnabled
    ? combineQueries([equity, oraclePrice, capital], (equity, oraclePrice, capital) =>
        getPositionPnlAndRoe({ equity, oraclePrice, capital }),
      )
    : DISABLED_Q
  return isEnabled ? { equity, pnl } : null
}
