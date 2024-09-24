import type { MutateBase, ApproveSwap, PoolSignerBase, Swap, SwapFormValues } from '@/entities/swap'

import { isAddress } from 'viem'

function enableBase({
  chainId,
  poolId,
  signerAddress = '',
  isLoadingDetails,
}: PoolSignerBase & Omit<MutateBase, 'isApproved'>) {
  return !!chainId && !!poolId && isAddress(signerAddress) && !isLoadingDetails
}

function getFromAmountValidity({
  fromAmount,
  fromAddress,
  fromError,
  fromToken,
}: Pick<SwapFormValues, 'fromAddress' | 'fromToken' | 'fromAmount' | 'fromError'>) {
  return {
    enabled: Number(fromAmount) > 0 && isAddress(fromAddress),
    error: fromError ? new Error(`Not enough ${fromToken}`) : null,
  }
}

export const enableApproveSwap = ({ isApproved, ...params }: ApproveSwap) => {
  const fromAmountValidity = getFromAmountValidity(params)

  return {
    enabled: enableBase(params) && !isApproved && fromAmountValidity.enabled && !fromAmountValidity.error,
    error: fromAmountValidity.error,
  }
}

export const enableSwap = ({ isApproved, toAddress, maxSlippage, ...params }: Swap) => {
  const fromAmountValidity = getFromAmountValidity(params)

  return {
    enabled:
      enableBase(params) &&
      isApproved &&
      !!toAddress &&
      Number(maxSlippage) > 0 &&
      fromAmountValidity.enabled &&
      !fromAmountValidity.error,
    error: fromAmountValidity.error,
  }
}
