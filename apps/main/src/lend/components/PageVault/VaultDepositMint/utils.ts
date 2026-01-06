import { DEFAULT_FORM_STATUS as FORM_STATUS } from '@/lend/components/PageLendMarket/utils'
import type { FormStatus, FormValues } from '@/lend/components/PageVault/VaultDepositMint/types'

export const DEFAULT_FORM_STATUS: FormStatus = {
  ...FORM_STATUS,
  step: '',
}

export const DEFAULT_FORM_VALUES: FormValues = {
  amount: '',
  amountError: '',
}
