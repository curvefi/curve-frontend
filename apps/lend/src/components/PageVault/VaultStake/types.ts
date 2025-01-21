import type { FormStatus as Fs } from '@lend/components/PageLoanManage/types'

export type FormValues = {
  amount: string
  amountError: 'too-much-wallet' | 'too-much-max' | ''
}

export type StepKey = 'APPROVAL' | 'STAKE' | ''

export interface FormStatus extends Fs {
  step: StepKey
}
