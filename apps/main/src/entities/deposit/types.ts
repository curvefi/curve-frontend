import type { ExtractQueryKeyType } from '@/shared/types/api'

import { depositKeys } from '@/entities/deposit/model'

export type DepositQueryKeyType<K extends keyof typeof depositKeys> = ExtractQueryKeyType<typeof depositKeys, K>

export type FormType = 'APPROVAL' | 'DEPOSIT' | 'DEPOSIT_STAKE' | 'STAKE' | ''

export type Amount = {
  value: string
  token: string
  tokenAddress: string
  error: 'too-much' | ''
}

export type DepositFormValues = {
  amount: { idx: number; value: string } | null
  amounts: Amount[]
  amountsError: string
  isBalancedAmounts: boolean
  apiError: string
}

export type StakeFormValues = {
  lpToken: string
  lpTokenError: 'too-much' | ''
}

// query
export type PoolBase = {
  chainId: ChainId | undefined
  poolId: string | undefined
}

export type PoolSignerBase = PoolBase & {
  signerAddress: string | undefined
}

export type DepositSeedAmounts = PoolBase & {
  isSeed: boolean | null | undefined
  isCrypto: boolean | undefined
  isMeta: boolean | undefined
  firstAmount: string
}

export type DepositBalancedAmounts = PoolBase & {
  isBalancedAmounts: boolean
  isWrapped: boolean
}

export type DepositDetails = PoolBase &
  Pick<DepositFormValues, 'amounts'> & {
    isInProgress: boolean
    formType: FormType
    isSeed: boolean | null
    isWrapped: boolean
    maxSlippage: string
  }

export type DepositEstGasApproval = PoolSignerBase &
  Pick<DepositFormValues, 'amounts' | 'amountsError'> & {
    isInProgress: boolean
    formType: FormType
    isWrapped: boolean
  }

export type StakeEstGasApproval = PoolSignerBase &
  StakeFormValues & {
    isInProgress: boolean
  }

// response
export type DepositDetailsResp = {
  expected: string
  isBonus: boolean
  isHighSlippage: boolean
  virtualPrice: string
  slippage: number
}

export type DepositEstGasApprovalResp = {
  isApproved: boolean
  estimatedGas: number | number[] | null
}

// mutate
export type MutateBase = PoolSignerBase & {
  isApproved: boolean
  isLoadingDetails: boolean
}

export type ApproveDeposit = MutateBase &
  Pick<DepositFormValues, 'amounts' | 'amountsError'> & {
    formType: FormType
    isWrapped: boolean
  }

export type Deposit = ApproveDeposit & {
  maxSlippage: string
}

export type Stake = MutateBase & StakeFormValues
