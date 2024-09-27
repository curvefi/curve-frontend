import type { PoolSignerBase } from '@/entities/pool'
import type { MutateBase, Stake, StakeFormValues } from '@/entities/stake'

import { isAddress } from 'viem'

function enableBase({
  chainId,
  poolId,
  signerAddress = '',
  isLoadingDetails,
}: PoolSignerBase & Omit<MutateBase, 'isApproved'>) {
  return !!chainId && !!poolId && isAddress(signerAddress) && !isLoadingDetails
}

export const approveStake = ({ isApproved, ...params }: Stake) => {
  const lpTokenValidity = getLpTokenValidity(params)

  return {
    enabled: enableBase(params) && !isApproved && lpTokenValidity.enabled && !lpTokenValidity.error,
    error: lpTokenValidity.error,
  }
}

export const stake = ({ isApproved, ...params }: Stake) => {
  const lpTokenValidity = getLpTokenValidity(params)

  return {
    enabled: enableBase(params) && isApproved && lpTokenValidity.enabled && !lpTokenValidity.error,
    error: lpTokenValidity.error,
  }
}

function getLpTokenValidity({ lpToken, lpTokenError }: StakeFormValues) {
  return {
    enabled: Number(lpToken) > 0,
    error: lpTokenError ? new Error('Not enough LP Tokens.') : null,
  }
}
