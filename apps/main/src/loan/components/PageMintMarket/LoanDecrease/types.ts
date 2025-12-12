import type { FormDetailInfo as Di, FormStatus as Fs } from '@/loan/components/PageMintMarket/types'
import { LiqRange } from '@/loan/types/loan.types'

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

export interface FormDetailInfo extends Di, LiqRange {}
