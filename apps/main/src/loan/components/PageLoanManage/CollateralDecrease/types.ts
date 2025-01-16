import type { FormDetailInfo as Di, FormStatus as Fs } from '@/components/PageLoanManage/types'

export type FormValues = {
  collateral: string
  collateralError: string
}

export type StepKey = 'REMOVE' | ''

export interface FormStatus extends Fs {
  step: StepKey
}

export interface FormDetailInfo extends Di, LiqRange {}
