import { ChainId, CurveApi, EstimatedGas, FormType } from '@/dao/types/dao.types'
import { DateValue } from '@react-types/calendar'

export type { FormType } from '@/dao/types/dao.types'

export type StepKey = 'APPROVE' | 'CREATE_LOCK' | 'INCREASE_CRV' | 'INCREASE_TIME' | 'APPROVAL' | 'WITHDRAW' | ''

export interface VecrvInfo {
  crv: string
  lockedAmountAndUnlockTime: { lockedAmount: string; unlockTime: number }
  veCrv: string
  veCrvPct: string
}

export interface PageVecrv {
  curve: CurveApi | null
  rChainId: ChainId
  rFormType: FormType
  vecrvInfo: VecrvInfo
}

export interface FormStatus {
  isApproved: boolean
  formProcessing: boolean
  formTypeCompleted: StepKey | ''
  step: StepKey
  error: string
}

export interface FormEstGas {
  loading: boolean
  estimatedGas: EstimatedGas | null
  error: string
}

export interface FormValues {
  utcDate: DateValue | null
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Existing violation before enabling this rule.
  utcDateError: 'invalid-date' | string
  days: number
  calcdUtcDate: string
  lockedAmt: string
  lockedAmtError: string
}
