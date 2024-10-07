import type { FormDetailInfo, FormStatus as Fs } from '@/components/PageLoanManage/types'
import type { InpError } from '@/components/PageLoanCreate/types'

export type FormValues = {
  userCollateral: string
  userCollateralError: InpError
  userBorrowed: string
  userBorrowedError: InpError
  debt: string
  debtError: InpError
}

export type StepKey = 'APPROVAL' | 'BORROW_MORE' | ''

export interface FormStatus extends Fs {
  step: StepKey
}

export type FormDetailInfoLeverage = FormDetailInfo & {
  expectedCollateral: ExpectedCollateral | null
  routes: Routes | null
  priceImpact: string
  isHighPriceImpact: boolean
}
