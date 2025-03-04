import type { FormStatus } from '@/lend/components/PageVault/VaultClaim/types'
import { DEFAULT_FORM_STATUS as FORM_STATUS } from '@/lend/components/PageLoanManage/utils'

export const DEFAULT_FORM_STATUS: FormStatus = {
  ...FORM_STATUS,
  step: '',
}
