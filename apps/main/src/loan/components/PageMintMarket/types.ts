import { ChainId, type CollateralUrlParams, LlamaApi, Llamma } from '@/loan/types/loan.types'

export interface FormStatus {
  isApproved: boolean
  isComplete: boolean
  isInProgress: boolean
  error: string
}

export interface FormEstGas {
  estimatedGas: number
  loading?: boolean
}

export interface FormDetailInfo {
  healthFull: string
  healthNotFull: string
  bands: [number, number]
  prices: string[]
  loading: boolean
}

export interface ManageLoanProps {
  curve: LlamaApi | null
  isReady: boolean
  market: Llamma | null
  params: CollateralUrlParams
  rChainId: ChainId
}

export interface FormValues {
  collateral: string
  collateralError: 'too-much' | string
  debt: string
  debtError: 'too-much' | string
  n: number | null
}

export type StepKey = 'APPROVAL' | 'CREATE' | ''

export interface PageLoanCreateProps {
  curve: LlamaApi | null
  isReady: boolean
  market: Llamma | null
  params: CollateralUrlParams
  rChainId: ChainId
}

export interface MaxRecvLeverage {
  maxBorrowable: string
  maxCollateral: string
  leverage: string
  routeIdx: number | null
}
