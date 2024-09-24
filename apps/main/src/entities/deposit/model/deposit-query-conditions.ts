import type {
  Amount,
  PoolBase,
  PoolSignerBase,
  DepositBalancedAmounts,
  DepositDetails,
  DepositEstGasApproval,
  StakeEstGasApproval,
} from '@/entities/deposit'

import { isAddress } from 'viem'

export function poolBase({ chainId, poolId }: PoolBase) {
  return !!chainId && !!poolId
}

export function poolSignerBase({ signerAddress = '', ...rest }: PoolSignerBase) {
  return poolBase(rest) && isAddress(signerAddress)
}

export const depositBalancedAmounts = ({ isBalancedAmounts, ...rest }: DepositBalancedAmounts) => {
  return poolBase(rest) && isBalancedAmounts
}

export const depositDetails = ({ formType, amounts, maxSlippage, isSeed, isInProgress, ...rest }: DepositDetails) => {
  const isValidSeed = isSeed !== null
  const isValidMaxSlippage = Number(maxSlippage) > 0
  return poolBase(rest) && !isInProgress && !!formType && isValidSeed && isValidTotal(amounts) && isValidMaxSlippage
}

export const depositEstGasApproval = ({ isInProgress, amounts, amountsError, ...rest }: DepositEstGasApproval) => {
  return poolSignerBase(rest) && !isInProgress && isValidTotal(amounts) && !amountsError
}

export const stakeEstGasApproval = ({ lpToken, lpTokenError, isInProgress, ...rest }: StakeEstGasApproval) => {
  return poolSignerBase(rest) && !isInProgress && Number(lpToken) > 0 && !lpTokenError
}

// helpers
export function total(amounts: Amount[]) {
  return amounts.reduce((sum, { value }) => {
    sum += Number(value)
    return sum
  }, 0)
}

function isValidTotal(amounts: Amount[]) {
  return total(amounts) > 0
}
