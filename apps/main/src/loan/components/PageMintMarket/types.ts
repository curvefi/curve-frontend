import { Dispatch, ReactNode, SetStateAction } from 'react'
import type { HealthMode } from '@/llamalend/llamalend.types'
import type { LiqRangeSliderIdx } from '@/loan/store/types'
import { ChainId, type CollateralUrlParams, LlamaApi, Llamma } from '@/loan/types/loan.types'
import type { Step } from '@ui/Stepper/types'

export type CreateFormType = 'create' | 'leverage'
export type ManageFormType = 'loan' | 'collateral' | 'swap' | 'deleverage'
export type LoanFormType = 'loan-increase' | 'loan-decrease' | 'loan-liquidate'
export type CollateralFormType = 'collateral-increase' | 'collateral-decrease'

export type FormStatus = {
  isApproved: boolean
  isComplete: boolean
  isInProgress: boolean
  error: string
}

export type FormEstGas = {
  estimatedGas: number
  loading?: boolean
}

export type FormDetailInfo = {
  healthFull: string
  healthNotFull: string
  bands: [number, number]
  prices: string[]
  loading: boolean
}

export type ManageLoanProps = {
  curve: LlamaApi | null
  isReady: boolean
  market: Llamma | null
  params: CollateralUrlParams
  rChainId: ChainId
}

export type FormValues = {
  collateral: string
  collateralError: 'too-much' | string
  debt: string
  debtError: 'too-much' | string
  n: number | null
}

export type StepKey = 'APPROVAL' | 'CREATE' | ''

export interface CreateFormStatus extends FormStatus {
  error: string
  warning: 'loan-exists' | string
  step: StepKey
}

export type PageLoanCreateProps = {
  curve: LlamaApi | null
  isReady: boolean
  market: Llamma | null
  params: CollateralUrlParams
  rChainId: ChainId
}

export type CreateFormDetailInfo = {
  activeKey: string
  activeKeyLiqRange: string
  chainId: ChainId
  curve: LlamaApi | null
  formEstGas: FormEstGas
  formValues: FormValues
  haveSigner: boolean
  healthMode: HealthMode
  isLeverage: boolean
  isReady: boolean
  llamma: Llamma | null
  steps: Step[]
  setHealthMode: Dispatch<SetStateAction<HealthMode>>
  updateFormValues: (updatedFormValues: FormValues) => void
}

export type FormDetailInfoLeverage = {
  collateral: string
  leverage: string
  routeName: string
  maxRange: number | null
  healthFull: string
  healthNotFull: string
  priceImpact: string
  isHighImpact: boolean
  bands: [number, number]
  prices: string[]
  error: string
  loading: boolean
}

export type FormDetailInfoSharedProps = {
  activeStep: number | null
  detailInfoLTV?: ReactNode
  isValidFormValues?: boolean
  llamma: Llamma | null
  selectedLiqRange: LiqRangeSliderIdx | undefined
  handleLiqRangesEdit(): void
  handleSelLiqRange(n: number): void
}

export type MaxRecvLeverage = {
  maxBorrowable: string
  maxCollateral: string
  leverage: string
  routeIdx: number | null
}
