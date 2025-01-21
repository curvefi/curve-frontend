import type { FormStatus as Fs } from '@lend/components/PageLoanManage/types'

export type FormValues = {
  amount: string
  amountError: 'too-much-wallet' | ''
}

export type StepKey = 'UNSTAKE' | ''

export interface FormStatus extends Fs {
  step: StepKey
}
