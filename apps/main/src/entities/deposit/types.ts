import type { ExtractQueryKeyType } from '@/shared/types/api'
import type { PoolQueryParams, PoolSignerBase } from '@/entities/pool'

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

// query
export type DepositSeedAmounts = PoolQueryParams & {
  isSeed: boolean | null | undefined
  isCrypto: boolean | undefined
  isMeta: boolean | undefined
  firstAmount: string
}

export type DepositBalancedAmounts = PoolQueryParams & {
  isBalancedAmounts: boolean
  isWrapped: boolean
}

export type DepositDetails = PoolQueryParams &
  Pick<DepositFormValues, 'amounts'> & {
    isInProgress: boolean
    formType: FormType
    isSeed: boolean | null
    isWrapped: boolean
    maxSlippage: string
  }

export type DepositApproval = PoolSignerBase &
  Pick<DepositFormValues, 'amounts' | 'amountsError'> & {
    isInProgress: boolean
    formType: FormType
    isWrapped: boolean
  }

export type DepositEstGas = PoolSignerBase &
  Pick<DepositFormValues, 'amounts' | 'amountsError'> & {
    isApproved: boolean
    isInProgress: boolean
    formType: FormType
    isWrapped: boolean
  }

// response
export type DepositDetailsResp = {
  expected: string
  isBonus: boolean
  isHighSlippage: boolean
  virtualPrice: string
  slippage: number
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
