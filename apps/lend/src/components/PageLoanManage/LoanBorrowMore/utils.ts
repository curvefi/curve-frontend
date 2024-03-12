import { FormStatus, FormValues } from '@/components/PageLoanManage/LoanBorrowMore/types'
import { DEFAULT_FORM_STATUS as FORM_STATUS } from '@/components/PageLoanManage/utils'

export const DEFAULT_FORM_STATUS: FormStatus = {
  ...FORM_STATUS,
  step: '',
}

export const DEFAULT_FORM_VALUES: FormValues = {
  collateral: '',
  collateralError: '',
  debt: '',
  debtError: '',
}
