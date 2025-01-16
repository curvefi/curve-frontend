export type DetailInfoTypes = 'user' | 'market'
export type FormType = 'loan' | 'collateral' | 'leverage'
export type LoanFormType = 'loan-increase' | 'loan-decrease' | 'loan-liquidate'
export type CollateralFormType = 'collateral-increase' | 'collateral-decrease'
export type LeverageFormType = 'leverage-borrow-more'

export type FormStatus = {
  isApproved: boolean
  isApprovedCompleted: boolean
  isComplete: boolean
  isInProgress: boolean
  error: string
  stepError: string
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
  error: string
}
