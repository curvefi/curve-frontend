import { DEFAULT_FORM_STATUS as FORM_STATUS } from '@/components/PageLoanManage/utils'
import type { FormStatus, FormValues } from '@/components/PageVault/VaultUnstake/types'


export const DEFAULT_FORM_STATUS: FormStatus = {
  ...FORM_STATUS,
  step: '',
}

export const DEFAULT_FORM_VALUES: FormValues = {
  amount: '',
  amountError: '',
}
