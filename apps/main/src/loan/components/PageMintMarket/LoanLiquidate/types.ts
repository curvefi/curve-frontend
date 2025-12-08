import type { FormStatus as Fs } from '@/loan/components/PageMintMarket/types'

export type FormValues = {
  maxSlippage: string
}

export type StepKey = 'APPROVAL' | 'LIQUIDATE' | ''

export interface FormStatus extends Fs {
  warning: 'not-in-liquidation-mode' | string
  step: StepKey
}
