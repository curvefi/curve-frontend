import type { Amount } from '@/dex/components/PagePool/utils'

export type FormType = 'UNSTAKE' | 'WITHDRAW' | 'CLAIM'
export type StepKey = 'APPROVAL' | 'UNSTAKE' | 'WITHDRAW' | 'CLAIM' | ''

export type FormStatus = {
  isApproved: boolean
  isClaimCrv: boolean
  isClaimRewards: boolean
  formProcessing: boolean
  formTypeCompleted: 'APPROVE' | 'CLAIM_CRV' | 'CLAIM_REWARDS' | 'WITHDRAW' | 'UNSTAKE' | ''
  step: StepKey | ''
  error: string
}

export type SelectedType = 'lpToken' | 'imbalance' | 'token'

export type FormValues = {
  amounts: Amount[]
  claimableRewards: ClaimableReward[]
  claimableCrv: string
  isWrapped: boolean
  lpToken: string
  stakedLpToken: string
  selected: SelectedType | ''
  selectedToken: string
  selectedTokenAddress: string
}
