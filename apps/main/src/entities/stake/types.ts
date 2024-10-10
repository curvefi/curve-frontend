import type { ExtractQueryKeyType } from '@/shared/types/api'
import type { PoolSignerBase } from '@/entities/pool'

import { stakeKeys } from '@/entities/stake/model'

export type StakeQueryKeyType<K extends keyof typeof stakeKeys> = ExtractQueryKeyType<typeof stakeKeys, K>

export type StakeFormValues = {
  lpToken: string
  lpTokenError: 'too-much' | ''
}

// query
export type StakeApproval = PoolSignerBase &
  StakeFormValues & {
    isInProgress: boolean
  }

export type StakeEstGas = PoolSignerBase &
  StakeFormValues & {
    isApproved: boolean
    isInProgress: boolean
  }

// mutate
export type MutateBase = PoolSignerBase & {
  isApproved: boolean
  isLoadingDetails: boolean
}

export type Stake = MutateBase & StakeFormValues
