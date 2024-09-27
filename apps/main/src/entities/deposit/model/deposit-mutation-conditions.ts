import type { ApproveDeposit, Deposit, DepositFormValues, MutateBase } from '@/entities/deposit'
import type { PoolSignerBase } from '@/entities/pool'

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
