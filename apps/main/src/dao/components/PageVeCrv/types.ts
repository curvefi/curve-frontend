import { ChainId, CurveApi } from '@/dao/types/dao.types'
import type { Decimal } from '@primitives/decimal.utils'

export type { FormType } from '@/dao/types/dao.types'

export type VecrvInfo = {
  crv: Decimal
  lockedAmountAndUnlockTime: {
    lockedAmount: Decimal
    /** Unix timestamp in milliseconds. */
    unlockTime: number
  }
  veCrv: Decimal
  veCrvPct: Decimal
}

export type PageVecrv = {
  curve: CurveApi | null
  rChainId: ChainId
  vecrvInfo: VecrvInfo
}
