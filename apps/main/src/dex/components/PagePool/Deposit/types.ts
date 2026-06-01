import type { Amount } from '@/dex/components/PagePool/utils'

export type StepKey = 'APPROVAL' | 'DEPOSIT' | 'DEPOSIT_STAKE' | 'STAKE' | ''
export type FormType = 'DEPOSIT' | 'DEPOSIT_STAKE' | 'STAKE'

export interface FormStatus {
  isApproved: boolean
  formProcessing: boolean
  formTypeCompleted: FormType | 'APPROVE' | ''
  step: StepKey | ''
  error: 'lpToken-too-much' | string
  warning: string
}

export interface FormValues {
  amounts: Amount[]
  /**
   * The balanced amounts switch works as follows:
   * - when selected, we calculate balanced amounts based on the wallet balances ('by-wallet')
   *   - this happens in curvejs, and tokens with zero balance are ignored
   * - when form values change, we recalculate the other amounts based on the changed value, ignoring the wallet ('by-form')
   */
  isBalancedAmounts: 'by-wallet' | 'by-form' | false
  isWrapped: boolean
  lpToken: string
}

export interface FormLpTokenExpected {
  expected: string
  virtualPrice: string
  loading: boolean
  error: string
}

export interface LoadMaxAmount {
  tokenAddress: string
  idx: number
}
