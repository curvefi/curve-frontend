import type { PoolQueryParams, PoolSignerBase } from '@/entities/pool'
import type { Amount, DepositApproval, DepositBalancedAmounts, DepositDetails, DepositEstGas } from '@/entities/deposit'

import { isAddress } from 'viem'

export function poolBase({ chainId, poolId }: PoolQueryParams) {
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

export const depositApproval = ({ isInProgress, amounts, amountsError, ...rest }: DepositApproval) => {
  return poolSignerBase(rest) && !isInProgress && isValidTotal(amounts) && !amountsError
}

export const depositEstGas = ({ isInProgress, amounts, amountsError, ...rest }: DepositEstGas) => {
  return poolSignerBase(rest) && !isInProgress && isValidTotal(amounts) && !amountsError
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
