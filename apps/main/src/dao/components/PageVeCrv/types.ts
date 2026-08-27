import { ChainId, CurveApi } from '@/dao/types/dao.types'

export type { FormType } from '@/dao/types/dao.types'

export type VecrvInfo = {
  crv: string
  lockedAmountAndUnlockTime: { lockedAmount: string; unlockTime: number }
  veCrv: string
  veCrvPct: string
}

export type PageVecrv = {
  curve: CurveApi | null
  rChainId: ChainId
  vecrvInfo: VecrvInfo
}
