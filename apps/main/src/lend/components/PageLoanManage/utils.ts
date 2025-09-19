import { FormEstGas, FormStatus } from '@/lend/components/PageLoanManage/types'
import { HealthMode } from '@/lend/types/lend.types'

export const DEFAULT_HEALTH_MODE: HealthMode = {
  percent: '',
  colorKey: '',
  icon: null,
  message: null,
  warningTitle: '',
  warning: '',
}

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
