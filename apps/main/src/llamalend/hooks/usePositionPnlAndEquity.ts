import { getEquity } from '@/llamalend/equity-leverage.utils'
import { useMarketContext } from '@/llamalend/features/market-context'
import { usePositionCapital } from '@/llamalend/features/user-position-history/queries/position-capital'
import { isLegacyMintController } from '@/llamalend/markets.constants'
import { getPositionPnlAndRoe, type PositionPnlAndRoe } from '@/llamalend/position-pnl.utils'
import { useMarketOraclePrice } from '@/llamalend/queries/market/market-oracle-price.query'
import { useUserState } from '@/llamalend/queries/user/user-state.query'
import { useLlamalendPositionPnl } from '@evm-ui/hooks/useFeatureFlags'
import type { UserMarketParams } from '@evm-ui/queries/query-types'
import { BlockchainIds } from '@evm-ui/utils/network'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { q, type QueryProp } from '@ui/features/queries/util'

export type PositionPnlAndEquityQueries = { equity: QueryProp<Decimal>; pnl: QueryProp<PositionPnlAndRoe | null> }

/** Equity and PNL of the open borrow position */
export function usePositionPnlAndEquity(params: UserMarketParams): PositionPnlAndEquityQueries | null {
  const isEnabled = useLlamalendPositionPnl()
  const { marketType, controllerAddress, chainId, userAddress } = useMarketContext()
  const blockchainId = BlockchainIds[chainId]
  const position = q(useUserState(params, isEnabled))
  const oraclePrice = q(useMarketOraclePrice(params, isEnabled))
  const capital = q(
    usePositionCapital(marketType, { blockchainId, contractAddress: controllerAddress, userAddress }, isEnabled),
  )
  const hasRoe = !isLegacyMintController(blockchainId, controllerAddress)
  const equity = combineQueries([position, oraclePrice], getEquity)
  const pnl = combineQueries([equity, oraclePrice, capital], (equity, oraclePrice, capital) =>
    getPositionPnlAndRoe({ equity, oraclePrice, capital, hasRoe }),
  )
  return isEnabled ? { equity, pnl } : null
}
