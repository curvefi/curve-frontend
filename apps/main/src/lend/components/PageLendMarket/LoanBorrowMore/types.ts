import type { FormDetailInfo, InpError } from '@/lend/components/PageLendMarket/types'
import { ExpectedCollateral, type FormStatus as Fs } from '@/lend/types/lend.types'

export type FormValues = {
  userCollateral: string
  userCollateralError: InpError
  userBorrowed: string
  userBorrowedError: InpError
  debt: string
  debtError: InpError
}

export type StepKey = 'APPROVAL' | 'BORROW_MORE' | ''

export type FormStatus = {
  step: StepKey
} & Fs

export type FormDetailInfoLeverage = FormDetailInfo & {
  expectedCollateral: ExpectedCollateral | null
  routeImage: string | null
  priceImpact: string
  isHighPriceImpact: boolean
}
