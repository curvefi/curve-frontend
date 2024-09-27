import type { Stake, StakeApproval, StakeEstGas } from '@/entities/stake'

import { poolKeys } from '@/entities/pool'

export const stakeKeys = {
  // query
  stakeApproval: ({ lpToken, lpTokenError, ...rest }: StakeApproval) => {
    return [...poolKeys.signerBase(rest), 'stakeApproval', lpToken, lpTokenError] as const
  },
  stakeEstGas: ({ isApproved, lpToken, lpTokenError, ...rest }: StakeEstGas) => {
    return [...poolKeys.signerBase(rest), 'stakeEstGas', isApproved, lpToken, lpTokenError] as const
  },

  // mutation
  approveStake: ({ lpToken, ...rest }: Stake) => {
    return [...poolKeys.signerBase(rest), 'approveStake', lpToken] as const
  },
  stake: ({ lpToken, ...rest }: Stake) => {
    return [...poolKeys.signerBase(rest), 'stake', lpToken] as const
  },
}
