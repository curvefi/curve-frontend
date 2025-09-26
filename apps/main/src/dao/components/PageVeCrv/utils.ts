import type { FormEstGas, FormStatus, FormValues } from '@/dao/components/PageVeCrv/types'

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
