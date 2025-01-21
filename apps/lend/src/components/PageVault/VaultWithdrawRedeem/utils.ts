import type { FormStatus, FormValues } from '@lend/components/PageVault/VaultWithdrawRedeem/types'

export const DEFAULT_FORM_STATUS: FormStatus = {
  isComplete: false,
  isInProgress: false,
  error: '',
  step: '',
  stepError: '',
}

export const DEFAULT_FORM_VALUES: FormValues = {
  amount: '',
  amountError: '',
  isFullWithdraw: false,
}
