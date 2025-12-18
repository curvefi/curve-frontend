import type { FormStatus as Fs } from '@/lend/types/lend.types'

export type FormValues = {
  amount: string
  amountError: 'too-much-wallet' | 'too-much-max' | ''
}

export type StepKey = 'APPROVAL' | 'DEPOSIT_MINT' | ''

export interface FormStatus extends Fs {
  step: StepKey
}
