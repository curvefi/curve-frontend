import type { FormDetailInfo as Di, FormStatus as Fs } from '@/components/PageLoanManage/types'

export type FormValues = {
  debt: string
  debtError: 'too-much-state' | 'too-much-wallet' | ''
  isFullRepay: boolean
}

export type StepKey = 'APPROVAL' | 'REPAY' | ''

export interface FormStatus extends Fs {
  warning: string
  step: StepKey
}

export interface FormDetailInfo extends Di, LiqRange {}
