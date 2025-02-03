import type { FormStatus as Fs } from '@/lend/components/PageLoanManage/types'
import { FormWarning } from '@/lend/components/AlertFormWarning'

export type StepKey = 'APPROVAL' | 'SELF_LIQUIDATE' | ''

export interface FormStatus extends Fs {
  loading: boolean
  warning: FormWarning | ''
  step: StepKey
}
