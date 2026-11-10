import type { FormStatus, FormValues } from '@/dex/components/PagePool/Withdraw/types'

export const DEFAULT_FORM_VALUES: FormValues = {
  amounts: [],
  claimableRewards: [],
  claimableCrv: '',
  isWrapped: false,
  lpToken: '',
  stakedLpToken: '',
  selected: '',
  selectedToken: '',
  selectedTokenAddress: '',
}

export const DEFAULT_FORM_STATUS: FormStatus = {
  isApproved: false,
  isClaimCrv: false,
  isClaimRewards: false,
  formProcessing: false,
  formTypeCompleted: '',
  step: '',
  error: '',
}

export const resetFormAmounts = (formValues: FormValues) => formValues.amounts.map(a => ({ ...a, value: '' }))
