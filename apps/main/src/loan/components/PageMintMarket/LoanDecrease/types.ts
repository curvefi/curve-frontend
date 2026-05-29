import type { FormStatus as Fs } from '@/loan/components/PageMintMarket/types'

export interface FormValues {
  debt: string
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Existing violation before enabling this rule.
  debtError: 'too-much' | 'not-enough' | string
  isFullRepay: boolean
}

export type StepKey = 'APPROVAL' | 'PAY' | ''

export interface FormStatus extends Fs {
  warning: string
  step: StepKey
}
