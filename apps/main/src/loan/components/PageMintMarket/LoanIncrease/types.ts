import type { FormStatus as Fs } from '@/loan/components/PageMintMarket/types'

export type FormValues = {
  collateral: string
  collateralError: 'too-much' | string
  debt: string
  debtError: 'too-much' | string
}

export type StepKey = 'APPROVAL' | 'BORROW' | ''

export interface FormStatus extends Fs {
  step: StepKey
}
