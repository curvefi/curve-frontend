import type {
  MutateBase,
  ApproveDeposit,
  PoolSignerBase,
  Deposit,
  Stake,
  StakeFormValues,
  DepositFormValues,
} from '@/entities/deposit'

import { isAddress } from 'viem'
import { total } from '@/entities/deposit'

function enableBase({
  chainId,
  poolId,
  signerAddress = '',
  isLoadingDetails,
}: PoolSignerBase & Omit<MutateBase, 'isApproved'>) {
  return !!chainId && !!poolId && isAddress(signerAddress) && !isLoadingDetails
}

function getAmountsValidity({ amounts, amountsError }: Pick<DepositFormValues, 'amounts' | 'amountsError'>) {
  return {
    enabled: total(amounts) > 0,
    error: amountsError ? new Error(amountsError) : null,
  }
}

export const approveDepositValidity = (params: ApproveDeposit) => {
  const amountsValidity = getAmountsValidity(params)
  const error = amountsValidity.error

  return {
    enabled: enableBase(params) && amountsValidity.enabled && !error,
    error,
  }
}

export const depositValidity = ({ isApproved, maxSlippage, ...params }: Deposit) => {
  const amountsValidity = getAmountsValidity(params)

  return {
    enabled:
      enableBase(params) && isApproved && Number(maxSlippage) > 0 && amountsValidity.enabled && !amountsValidity.error,
    error: amountsValidity.error,
  }
}

function getLpTokenValidity({ lpToken, lpTokenError }: StakeFormValues) {
  return {
    enabled: Number(lpToken) > 0,
    error: lpTokenError ? new Error('Not enough LP Tokens.') : null,
  }
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
