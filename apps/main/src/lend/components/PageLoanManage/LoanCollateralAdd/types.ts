import type { FormStatus as Fs } from '@/lend/components/PageLoanManage/types'

export type FormValues = {
  collateral: string
  collateralError: string
}

export type StepKey = 'APPROVAL' | 'ADD' | ''

export interface FormStatus extends Fs {
  step: StepKey
}
