import type { FormStatus as Fs } from '@/loan/components/PageMintMarket/types'

export type StepKey = 'APPROVAL' | 'LIQUIDATE' | ''

export type FormStatus = {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Existing violation before enabling this rule.
  warning: 'not-in-liquidation-mode' | string
  step: StepKey
} & Fs
