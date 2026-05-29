import type { FormStatus as Fs } from '@/lend/types/lend.types'

export interface FormValues {
  amount: string
  amountError: 'too-much-wallet' | ''
}

export type StepKey = 'UNSTAKE' | ''

export interface FormStatus extends Fs {
  step: StepKey
}
