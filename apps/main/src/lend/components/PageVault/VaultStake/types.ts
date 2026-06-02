import type { FormStatus as Fs } from '@/lend/types/lend.types'

export type FormValues = {
  amount: string
  amountError: 'too-much-wallet' | 'too-much-max' | ''
}

export type StepKey = 'APPROVAL' | 'STAKE' | ''

export type FormStatus = {
  step: StepKey
} & Fs
