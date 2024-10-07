import { DEFAULT_FORM_STATUS as FORM_STATUS } from '@/components/PageLoanManage/utils'
import type { FormStatus } from '@/components/PageVault/VaultClaim/types'


export const DEFAULT_FORM_STATUS: FormStatus = {
  ...FORM_STATUS,
  step: '',
}
