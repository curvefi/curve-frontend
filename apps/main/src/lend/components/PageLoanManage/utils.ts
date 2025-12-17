import { FormEstGas, FormStatus } from '@/lend/components/PageLoanManage/types'

export const DEFAULT_FORM_EST_GAS: FormEstGas = {
  estimatedGas: 0,
  loading: false,
}

export const DEFAULT_FORM_STATUS: FormStatus = {
  isApproved: false,
  isApprovedCompleted: false,
  isComplete: false,
  isInProgress: false,
  error: '',
  stepError: '',
}

export const DEFAULT_CONFIRM_WARNING = {
  isConfirming: false,
  confirmedWarning: false,
}
