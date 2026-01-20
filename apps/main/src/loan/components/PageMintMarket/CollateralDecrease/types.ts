import type { FormDetailInfo as Di, FormStatus as Fs } from '@/loan/components/PageMintMarket/types'
import { LiqRange } from '@/loan/types/loan.types'

export type FormValues = {
  collateral: string
  collateralError: string
}

export type StepKey = 'REMOVE' | ''

export interface FormStatus extends Fs {
  step: StepKey
}

export interface FormDetailInfo extends Di, LiqRange {}
