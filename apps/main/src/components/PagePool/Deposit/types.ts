import type { Amount } from '@/components/PagePool/utils'

export type StepKey = 'APPROVAL' | 'DEPOSIT' | 'DEPOSIT_STAKE' | 'STAKE' | ''
export type FormType = 'DEPOSIT' | 'DEPOSIT_STAKE' | 'STAKE'

export type FormStatus = {
  isApproved: boolean
  formProcessing: boolean
  formTypeCompleted: FormType | 'APPROVE' | ''
  step: StepKey | ''
  error: 'lpToken-too-much' | string
  warning: string
}

export type FormValues = {
  amounts: Amount[]
  isBalancedAmounts: boolean
  isWrapped: boolean
  lpToken: string
}

export type FormLpTokenExpected = {
  expected: string
  virtualPrice: string
  loading: boolean
  error: string
}

export type LoadMaxAmount = {
  tokenAddress: string
  idx: number
}
