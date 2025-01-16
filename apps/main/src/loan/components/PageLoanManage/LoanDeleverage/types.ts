import type { FormDetailInfo as Di, FormStatus as Fs } from '@/components/PageLoanManage/types'

export type FormValues = {
  isFullRepay: boolean
  collateral: string
  collateralError: 'too-much' | ''
}

export type StepKey = 'REPAY' | ''

export interface FormStatus extends Fs {
  warning: string
  step: StepKey
}

export interface FormDetailInfo extends Di, LiqRange {
  receiveStablecoin: string
  isAvailable: boolean | null
  isFullRepayment: boolean
  routeName: string
  priceImpact: string
  isHighImpact: boolean
  error: string
}
