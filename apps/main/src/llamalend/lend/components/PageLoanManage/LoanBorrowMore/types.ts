import type { InpError } from '@/lend/components/PageLoanCreate/types'
import type { FormDetailInfo, FormStatus as Fs } from '@/lend/components/PageLoanManage/types'
import { ExpectedCollateral } from '@/lend/types/lend.types'

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
  routeImage: string | null
  priceImpact: string
  isHighPriceImpact: boolean
}
