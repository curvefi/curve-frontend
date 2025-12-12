import type { FormDetailInfo as Di, FormStatus as Fs } from '@/loan/components/PageMintMarket/types'
import { LiqRange } from '@/loan/types/loan.types'

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

export interface FormDetailInfo extends Di, LiqRange {}
