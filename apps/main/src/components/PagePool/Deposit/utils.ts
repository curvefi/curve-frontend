import { FormLpTokenExpected, FormStatus, FormValues } from '@/components/PagePool/Deposit/types'

export const DEFAULT_FORM_VALUES: FormValues = {
  amounts: [],
  isWrapped: false,
  isBalancedAmounts: false,
  lpToken: '',
}

export const DEFAULT_FORM_STATUS: FormStatus = {
  isApproved: false,
  formProcessing: false,
  formTypeCompleted: '',
  step: '',
  error: '',
  warning: '',
}

export const DEFAULT_FORM_LP_TOKEN_EXPECTED: FormLpTokenExpected = {
  expected: '',
  virtualPrice: '',
  loading: false,
  error: '',
}
