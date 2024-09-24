import type { ExtractQueryKeyType } from '@/shared/types/api'

import { withdrawKeys } from '@/entities/withdraw'

export type WithdrawQueryKeyType<K extends keyof typeof withdrawKeys> = ExtractQueryKeyType<typeof withdrawKeys, K>

export type FormType = 'APPROVAL' | 'UNSTAKE' | 'WITHDRAW' | 'CLAIM' | 'CLAIM_CRV' | 'CLAIM_REWARDS' | ''

export type SelectedType = 'one-coin' | 'balanced' | 'custom-lpToken' | 'custom-amounts'

export type Amount = {
  value: string
  token: string
  tokenAddress: string
}

export type WithdrawFormValues = {
  selected: SelectedType | ''
  lpToken: string
  lpTokenError: 'too-much' | ''
  amounts: Amount[]
  amount: { value: string; idx: number } | null
  selectedToken: string
  selectedTokenAddress: string
}

export type UnstakeFormValues = {
  gauge: string
  gaugeError: 'too-much' | ''
}

// query
export type PoolBase = {
  chainId: ChainId | undefined
  poolId: string | undefined
}

export type PoolSignerBase = PoolBase & {
  signerAddress: string | undefined
}

export type WithdrawDetails = PoolBase &
  Pick<WithdrawFormValues, 'selected' | 'selectedTokenAddress' | 'amounts' | 'lpToken'> & {
    isInProgress?: boolean
    isWrapped: boolean
    maxSlippage: string
  }

export type WithdrawEstGasApproval = PoolSignerBase &
  Pick<WithdrawFormValues, 'selected' | 'selectedTokenAddress' | 'amounts' | 'lpToken' | 'lpTokenError'> & {
    isInProgress: boolean
    isWrapped: boolean
  }

export type UnstakeEstGas = PoolSignerBase &
  Pick<UnstakeFormValues, 'gauge' | 'gaugeError'> & {
    isInProgress: boolean
  }

// response
export type WithdrawEstGasApprovalResp = {
  isApproved: boolean
  estimatedGas: number | number[] | null
}

export type WithdrawDetailsResp = {
  expectedAmounts: string[]
  expected: string
  bonus: string
  slippage: number | null
  isHighSlippage: boolean
  isBonus: boolean
}

export type ClaimableDetailsResp = {
  claimableCrv: string
  claimableRewards: {
    token: string
    symbol: string
    amount: string
  }[]
}

// mutate
export type MutateBase = PoolSignerBase & {
  isApproved: boolean
  isLoadingDetails: boolean
}

export type ApproveWithdraw = MutateBase &
  Pick<WithdrawFormValues, 'selected' | 'selectedToken' | 'amounts' | 'lpToken' | 'lpTokenError'> & {
    isWrapped: boolean
  }

export type Withdraw = MutateBase &
  Pick<WithdrawFormValues, 'selected' | 'selectedTokenAddress' | 'amounts' | 'lpToken' | 'lpTokenError'> & {
    isApproved: boolean
    isWrapped: boolean
    maxSlippage: string
  }

export type Unstake = MutateBase & Pick<UnstakeFormValues, 'gauge' | 'gaugeError'>

export type ClaimType = 'CLAIM_CRV' | 'CLAIM_REWARDS' | ''

export type Claim = MutateBase & {
  claimType: ClaimType
  claimableCrv: string
  claimableRewards: {
    token: string
    symbol: string
    amount: string
  }[]
}
