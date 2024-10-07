import { FormWarning } from '@/components/AlertFormWarning'
import type { FormStatus as Fs } from '@/components/PageLoanManage/types'

export type StepKey = 'APPROVAL' | 'SELF_LIQUIDATE' | ''

export interface FormStatus extends Fs {
  loading: boolean
  warning: FormWarning | ''
  step: StepKey
}
