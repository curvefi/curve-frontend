import { DateValue } from '@react-types/calendar'
import { CurveApi, ChainId, EstimatedGas } from '@/types/dao.types'

export type FormType = 'create' | 'adjust_crv' | 'adjust_date'
export type StepKey = 'APPROVE' | 'CREATE_LOCK' | 'INCREASE_CRV' | 'INCREASE_TIME' | 'APPROVAL' | 'WITHDRAW' | ''

export type VecrvInfo = {
  crv: string
  lockedAmountAndUnlockTime: { lockedAmount: string; unlockTime: number }
  veCrv: string
  veCrvPct: string
}

export type PageVecrv = {
  curve: CurveApi | null
  rChainId: ChainId
  rFormType: FormType
  vecrvInfo: VecrvInfo
  toggleForm: (formType: FormType) => void
}

export type FormStatus = {
  isApproved: boolean
  formProcessing: boolean
  formTypeCompleted: StepKey | ''
  step: StepKey
  error: string
}

export type FormEstGas = {
  loading: boolean
  estimatedGas: EstimatedGas | null
  error: string
}

export type FormValues = {
  utcDate: DateValue | null
  utcDateError: 'invalid-date' | string
  days: number
  calcdUtcDate: string
  lockedAmt: string
  lockedAmtError: string
}
