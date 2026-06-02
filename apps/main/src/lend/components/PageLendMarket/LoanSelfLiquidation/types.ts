import { type FormStatus as Fs, FormWarning } from '@/lend/types/lend.types'

export type StepKey = 'APPROVAL' | 'SELF_LIQUIDATE' | ''

export type FormStatus = {
  loading: boolean
  warning: FormWarning | ''
  step: StepKey
} & Fs
