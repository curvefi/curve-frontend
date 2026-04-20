import { DetailInfoResp, type FormStatus as Fs, FutureRates } from '@/lend/types/lend.types'

export type StepKey = 'APPROVAL' | 'CREATE' | ''
export type InpError = 'too-much' | 'too-much-max' | ''

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

export type DetailInfo = DetailInfoResp & {
  loading: boolean
  error: string
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
