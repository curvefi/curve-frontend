import type { FormStatus as Fs } from '@/components/PageLoanManage/types'

export type RewardType = 'crv' | 'rewards'
export type StepKey = 'CLAIM_CRV' | 'CLAIM_REWARDS' | ''

export interface FormStatus extends Fs {
  step: StepKey
}
