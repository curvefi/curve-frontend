import type { FormStatus as Fs } from '@/lend/types/lend.types'

export type RewardType = 'crv' | 'rewards'
export type StepKey = 'CLAIM_CRV' | 'CLAIM_REWARDS' | ''

export interface FormStatus extends Fs {
  step: StepKey
}
