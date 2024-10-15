import type { PoolQueryParams, PoolSignerBase } from '@/entities/pool'
import type {
  Amount,
  Claim,
  WithdrawDetails,
  WithdrawApproval,
  WithdrawEstGas,
  UnstakeEstGas,
} from '@/entities/withdraw'

import { isAddress } from 'viem'

export function enableBase({ chainId, poolId }: PoolQueryParams) {
  return !!chainId && !!poolId
}

export function enableSignerBase({ chainId, signerAddress = '', poolId }: PoolSignerBase) {
  return !!chainId && !!poolId && isAddress(signerAddress)
}

export const withdrawBalancedDetails = ({
  isInProgress,
  selected,
  lpToken,
  amounts,
  selectedTokenAddress,
  isWrapped,
  ...rest
}: WithdrawDetails) => {
  if (selected === 'one-coin') return enableBase(rest) && !isInProgress && Number(lpToken) > 0 && !!selectedTokenAddress
  if (selected === 'balanced') return enableBase(rest) && !isInProgress && Number(lpToken) > 0
  if (selected === 'custom-lpToken') return enableBase(rest) && !isInProgress && Number(lpToken) > 0
  if (selected === 'custom-amounts') return enableBase(rest) && !isInProgress && total(amounts) > 0
  return false
}

export const claimableDetails = ({ ...rest }: PoolSignerBase) => {
  return enableSignerBase(rest)
}

export const withdrawApproval = ({
  selected,
  lpToken,
  lpTokenError,
  amounts,
  selectedTokenAddress,
  isWrapped,
  isInProgress,
  ...rest
}: WithdrawApproval) => {
  const validLpToken = Number(lpToken) > 0 && !lpTokenError
  if (selected === 'one-coin') return enableSignerBase(rest) && !isInProgress && validLpToken && !!selectedTokenAddress
  if (selected === 'balanced' || selected === 'custom-lpToken')
    return enableSignerBase(rest) && !isInProgress && validLpToken
  if (selected === 'custom-amounts')
    return enableSignerBase(rest) && !isInProgress && total(amounts) > 0 && validLpToken
  return false
}

export const withdrawEstGas = ({
  selected,
  isApproved,
  lpToken,
  lpTokenError,
  amounts,
  selectedTokenAddress,
  isWrapped,
  isInProgress,
  ...rest
}: WithdrawEstGas) => {
  const validLpToken = Number(lpToken) > 0 && !lpTokenError
  const enabledBase = enableSignerBase(rest) && isApproved
  if (selected === 'one-coin') return enabledBase && !isInProgress && validLpToken && !!selectedTokenAddress
  if (selected === 'balanced' || selected === 'custom-lpToken') return enabledBase && !isInProgress && validLpToken
  if (selected === 'custom-amounts') return enabledBase && !isInProgress && total(amounts) > 0 && validLpToken
  return false
}

export const unstakeEstGas = ({ gauge, gaugeError, isInProgress, ...rest }: UnstakeEstGas) => {
  return enableSignerBase(rest) && !isInProgress && Number(gauge) > 0 && !gaugeError
}

export const claimEstGas = ({ claimableCrv, claimableRewards, ...rest }: Claim) => {
  return enableSignerBase(rest) && (Number(claimableCrv) > 0 || Number(claimableRewards) > 0)
}

// helpers
export function total(amounts: Amount[]) {
  return amounts.reduce((sum, { value }) => {
    sum += Number(value)
    return sum
  }, 0)
}
