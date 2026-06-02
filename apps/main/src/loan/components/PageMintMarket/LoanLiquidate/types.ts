import type { FormStatus as Fs } from '@/loan/components/PageMintMarket/types'

export type StepKey = 'APPROVAL' | 'LIQUIDATE' | ''

export type FormStatus = {
  warning: 'not-in-liquidation-mode' | string
  step: StepKey
} & Fs
