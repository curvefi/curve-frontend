import type { FormStatus as Fs } from '@/loan/components/PageMintMarket/types'

export type FormValues = {
  collateral: string
  collateralError: string
}

export type StepKey = 'REMOVE' | ''

export type FormStatus = {
  step: StepKey
} & Fs
