import type { FormStatus as Fs } from '@/components/PageLoanManage/types'
import { FormWarning } from '@/components/AlertFormWarning'

export type StepKey = 'APPROVAL' | 'SELF_LIQUIDATE' | ''

export interface FormStatus extends Fs {
  loading: boolean
  warning: FormWarning | ''
  step: StepKey
}
