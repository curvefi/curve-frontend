import React from 'react'
import type { LiqRangeSliderIdx } from '@/lend/store/types'
import type { FormStatus as Fs } from '@/lend/components/PageLoanManage/types'
import type { Step } from '@ui/Stepper/types'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'

export type FormType = 'create' | 'vault' | 'leverage'
export type StepKey = 'APPROVAL' | 'CREATE' | ''
export type InpError = 'too-much' | ''

export type FormValues = {
  userCollateral: string
  userCollateralError: InpError
  userBorrowed: string
  userBorrowedError: InpError | 'too-much-debt'
  debt: string
  debtError: InpError
  n: number | null
}

export interface FormStatus extends Fs {
  error: string
  warning: 'loan-exists' | string
  step: StepKey
}

export type FormEstGas = {
  estimatedGas: number
  loading?: boolean
}

export type DetailInfoCompProps = {
  healthMode: HealthMode
  market: OneWayMarketTemplate | null
  steps: Step[]
  setHealthMode: React.Dispatch<React.SetStateAction<HealthMode>>
  updateFormValues: (updatedFormValues: FormValues) => void
}

export type DetailInfoCompAdditionalProps = {
  activeStep: number | null
  selectedLiqRange: LiqRangeSliderIdx | undefined
  handleLiqRangesEdit(): void
  handleSelLiqRange(n: number): void
}

export type DetailInfo = DetailInfoResp & {
  loading: boolean
  error: string
}

export type DetailInfoLeverage = DetailInfoLeverageResp & {
  expectedCollateral: ExpectedCollateral | null
  routeImage: string | null
  loading: boolean
  error: string
}
