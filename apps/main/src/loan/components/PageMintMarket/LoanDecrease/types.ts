import type { FormStatus as Fs } from '@/loan/components/PageMintMarket/types'

export type FormValues = {
  debt: string
  debtError: 'too-much' | 'not-enough' | string
  isFullRepay: boolean
}

export type StepKey = 'APPROVAL' | 'PAY' | ''

export interface FormStatus extends Fs {
  warning: string
  step: StepKey
}
