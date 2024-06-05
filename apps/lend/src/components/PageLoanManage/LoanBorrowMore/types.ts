import type { FormDetailInfo as Di, FormStatus as Fs } from '@/components/PageLoanManage/types'

export type FormValues = {
  collateral: string
  collateralError: 'too-much-wallet' | ''
  debt: string
  debtError: 'too-much-max' | ''
}

export type StepKey = 'APPROVAL' | 'BORROW_MORE' | ''

export interface FormStatus extends Fs {
  step: StepKey
}

export interface FormDetailInfo extends Di, LiqRange {}
