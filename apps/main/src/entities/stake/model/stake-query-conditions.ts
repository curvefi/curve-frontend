import type { PoolQueryParams, PoolSignerBase } from '@/entities/pool'
import type { StakeApproval, StakeEstGas } from '@/entities/stake'

import { isAddress } from 'viem'

export function poolBase({ chainId, poolId }: PoolQueryParams) {
  return !!chainId && !!poolId
}

export function poolSignerBase({ signerAddress = '', ...rest }: PoolSignerBase) {
  return poolBase(rest) && isAddress(signerAddress)
}

export const stakeApproval = ({ lpToken, lpTokenError, isInProgress, ...rest }: StakeApproval) => {
  return poolSignerBase(rest) && !isInProgress && Number(lpToken) > 0 && !lpTokenError
}

export const stakeEstGas = ({ lpToken, lpTokenError, isInProgress, ...rest }: StakeEstGas) => {
  return poolSignerBase(rest) && !isInProgress && Number(lpToken) > 0 && !lpTokenError
}
