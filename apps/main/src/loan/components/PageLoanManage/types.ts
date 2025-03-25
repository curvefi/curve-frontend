import { ChainId, type CollateralUrlParams, Curve, Llamma, TitleMapper } from '@/loan/types/loan.types'
export type DetailInfoTypes = 'user' | 'llamma'
export type FormType = 'loan' | 'collateral' | 'swap' | 'deleverage'
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
  bands: [number, number]
  prices: string[]
  loading: boolean
}

export type PageLoanManageProps = {
  curve: Curve | null
  isReady: boolean
  llamma: Llamma | null
  llammaId: string
  params: CollateralUrlParams
  rChainId: ChainId
  rCollateralId: string
  rFormType: FormType
  titleMapper: TitleMapper
}
