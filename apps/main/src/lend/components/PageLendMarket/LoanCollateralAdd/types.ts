import type { FormStatus as Fs } from '@/lend/types/lend.types'

export type FormValues = {
  collateral: string
  collateralError: string
}

export type StepKey = 'APPROVAL' | 'ADD' | ''

export interface FormStatus extends Fs {
  step: StepKey
}
