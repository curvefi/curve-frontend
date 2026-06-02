import type { InpError } from '@/lend/components/PageLendMarket/types'
import type { FormStatus as Fs } from '@/lend/types/lend.types'

export type FormValues = {
  collateral: string
  collateralError: InpError
}

export type StepKey = 'REMOVE' | ''

export type FormStatus = {
  step: StepKey
} & Fs
