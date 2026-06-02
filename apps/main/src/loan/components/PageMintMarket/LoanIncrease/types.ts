import type { FormStatus as Fs } from '@/loan/components/PageMintMarket/types'

export type FormValues = {
  collateral: string
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Existing violation before enabling this rule.
  collateralError: 'too-much' | string
  debt: string
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Existing violation before enabling this rule.
  debtError: 'too-much' | string
}

export type StepKey = 'APPROVAL' | 'BORROW' | ''

export type FormStatus = {
  step: StepKey
} & Fs
