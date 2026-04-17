import { ChainId, type CollateralUrlParams, LlamaApi, Llamma } from '@/loan/types/loan.types'

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

export type PageLoanCreateProps = {
  curve: LlamaApi | null
  isReady: boolean
  market: Llamma | null
  params: CollateralUrlParams
  rChainId: ChainId
}

export type MaxRecvLeverage = {
  maxBorrowable: string
  maxCollateral: string
  leverage: string
  routeIdx: number | null
}
