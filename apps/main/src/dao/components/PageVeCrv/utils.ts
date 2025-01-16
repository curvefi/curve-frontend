import type { FormEstGas, FormStatus, FormValues, VecrvInfo } from '@/dao/components/PageVeCrv/types'

export const DEFAULT_USER_LOCKED_CRV_INFO: VecrvInfo = {
  crv: '0',
  lockedAmountAndUnlockTime: { lockedAmount: '0', unlockTime: 0 },
  veCrv: '0',
  veCrvPct: '0',
}

export const DEFAULT_FORM_EST_GAS: FormEstGas = {
  estimatedGas: 0,
  error: '',
  loading: false,
}

export const DEFAULT_FORM_STATUS: FormStatus = {
  isApproved: false,
  formProcessing: false,
  formTypeCompleted: '',
  step: '',
  error: '',
}

export const DEFAULT_FORM_VALUES: FormValues = {
  calcdUtcDate: '',
  days: 0,
  utcDate: null,
  utcDateError: '',
  lockedAmt: '',
  lockedAmtError: '',
}
