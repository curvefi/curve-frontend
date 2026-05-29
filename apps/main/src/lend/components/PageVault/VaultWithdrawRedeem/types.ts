import type { FormStatus as Fs } from '@/lend/types/lend.types'

export interface FormValues {
  amount: string
  amountError: 'too-much-wallet' | 'too-much-max' | ''
  isFullWithdraw: boolean
}

export type StepKey = 'APPROVAL' | 'WITHDRAW_REDEEM' | ''

export interface FormStatus extends Omit<Fs, 'isApproved' | 'isApprovedCompleted'> {
  step: StepKey
}
