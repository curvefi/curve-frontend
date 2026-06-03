import type { FormDetailInfo as Di, FormStatus as Fs } from '@/loan/components/PageMintMarket/types'
import { LiqRange } from '@/loan/types/loan.types'

export type FormValues = {
  isFullRepay: boolean
  collateral: string
  collateralError: 'too-much' | ''
}

export type StepKey = 'REPAY' | ''

export type FormStatus = {
  warning: string
  step: StepKey
} & Fs

export type FormDetailInfo = {
  receiveStablecoin: string
  isAvailable: boolean | null
  isFullRepayment: boolean
  routeName: string
  priceImpact: string
  isHighImpact: boolean
  error: string
} & Di &
  LiqRange
