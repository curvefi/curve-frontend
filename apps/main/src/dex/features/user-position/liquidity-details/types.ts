import type { Decimal } from '@primitives/decimal.utils'
import type { QueryProp } from '@ui/features/queries/util'

export type BalancedWithdrawRow = { address: string; symbol: string; amount: string | undefined }

export type LiquidityDetailsData = {
  hasPosition: boolean
  showBoost: boolean
  metrics: {
    positionValue: QueryProp<Decimal | null>
    lpTokenTotal: QueryProp<Decimal>
    boost: QueryProp<Decimal | null>
  }
  marketParticipation: {
    userLpShare: QueryProp<string>
    stakedBalance: QueryProp<Decimal>
    stakedPercent: QueryProp<Decimal>
    unstakedBalance: QueryProp<Decimal>
    unstakedPercent: QueryProp<Decimal>
  }
  rows: QueryProp<BalancedWithdrawRow[]>
}
