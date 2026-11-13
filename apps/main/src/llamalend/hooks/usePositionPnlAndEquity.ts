import { getEquity } from '@/llamalend/equity-leverage.utils'
import { useMarketContext } from '@/llamalend/features/market-context'
import { usePositionCapital } from '@/llamalend/features/user-position-history/queries/position-events-summary'
import { isZapV0MintMarket } from '@/llamalend/llama.utils'
import { getPositionPnlAndRoi, type PositionPnlAndRoi } from '@/llamalend/position-pnl.utils'
import { useMarketOraclePrice } from '@/llamalend/queries/market/market-oracle-price.query'
import { useUserState } from '@/llamalend/queries/user/user-state.query'
import { useLlamalendPositionPnl } from '@evm-ui/hooks/useFeatureFlags'
import type { UserMarketParams } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueries } from '@ui/features/queries/combine'
import type { QueryProp } from '@ui/features/queries/util'

export type PositionPnlAndEquityQueries = {
  equity: QueryProp<Decimal>
  /** Null when the market can't report the PNL, as opposed to a PNL that is still loading or unknown */
  pnl: QueryProp<PositionPnlAndRoi | null> | null
}

/** Equity and PNL of the open borrow position */
export function usePositionPnlAndEquity(params: UserMarketParams): PositionPnlAndEquityQueries | null {
  const isEnabled = useLlamalendPositionPnl()
  const { marketType, controllerAddress, blockchainId, userAddress } = useMarketContext()
  const position = useUserState(params, isEnabled)
  const oraclePrice = useMarketOraclePrice(params, isEnabled)
  // The prices API reports V0 zap leverage as plain borrows and repays, so their events can't give the position's capital
  const isPnlSupported = !isZapV0MintMarket(blockchainId, controllerAddress)
  const capital = usePositionCapital(
    marketType,
    { blockchainId, contractAddress: controllerAddress, userAddress },
    isEnabled && isPnlSupported,
  )
  const equity = combineQueries([position, oraclePrice], getEquity)
  const pnl = isPnlSupported
    ? combineQueries([equity, oraclePrice, capital], (equity, oraclePrice, capital) =>
        getPositionPnlAndRoi({ equity, oraclePrice, capital }),
      )
    : null
  return isEnabled ? { equity, pnl } : null
}
