import type { InpError } from '@/components/PageLoanCreate/types'
import type { FormStatus as Fs } from '@/components/PageLoanManage/types'

export type FormValues = {
  collateral: string
  collateralError: InpError
}

export type StepKey = 'REMOVE' | ''

export interface FormStatus extends Fs {
  step: StepKey
}
