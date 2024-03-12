export type DetailInfoTypes = 'user' | 'market'
export type FormType = 'loan' | 'collateral'
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
  futureRates: FutureRates | null
  bands: [number, number]
  prices: string[]
  loading: boolean
}
