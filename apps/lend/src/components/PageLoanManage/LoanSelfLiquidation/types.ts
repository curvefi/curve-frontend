import type { FormStatus as Fs } from '@/components/PageLoanManage/types'

export type StepKey = 'APPROVAL' | 'SELF_LIQUIDATE' | ''

export interface FormStatus extends Fs {
  warning: 'warning-not-in-liquidation-mode' | 'warning-not-enough-crvusd' | ''
  step: StepKey
}
