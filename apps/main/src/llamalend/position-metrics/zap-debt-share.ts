import { useUserCrvUsdCollateralEventsQuery } from '@/llamalend/features/user-position-history/queries/user-crvusd-collateral-events'
import { useUserLendCollateralEventsQuery } from '@/llamalend/features/user-position-history/queries/user-lend-collateral-events'
import { lendZapDebtShare, mintZapDebtShare } from '@/llamalend/position-metrics/zap-debt-share.utils'
import type { UserContractParams } from '@evm-ui/queries/root-keys'
import { MarketType } from '@evm-ui/types/market'
import type { Decimal } from '@primitives/decimal.utils'
import { mapQuery, q, type QueryProp } from '@ui/features/queries/util'

export type ZapDebtShareParams = UserContractParams & { marketType: MarketType }

export function useZapDebtShare({ marketType, ...params }: ZapDebtShareParams, enabled = true): QueryProp<Decimal> {
  const lend = useUserLendCollateralEventsQuery(params, enabled && marketType === MarketType.Lend)
  const mint = useUserCrvUsdCollateralEventsQuery(params, enabled && marketType === MarketType.Mint)
  return marketType === MarketType.Lend ? mapQuery(q(lend), lendZapDebtShare) : mapQuery(q(mint), mintZapDebtShare)
}
