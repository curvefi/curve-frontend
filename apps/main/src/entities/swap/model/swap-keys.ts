import type { PoolQueryParams, PoolSignerBase } from '@/entities/pool'
import type { ApproveSwap, Swap, SwapExchangeDetails, SwapApproval, SwapEstGas } from '@/entities/swap'

import { poolKeys } from '@/entities/pool'

export const swapKeys = {
  // query
  ignoreExchangeRateCheck: (params: PoolQueryParams) => {
    return [...poolKeys.root(params), 'ignoreExchangeRateCheck'] as const
  },
  swapExchangeDetails: ({
    isFrom,
    fromAmount,
    fromAddress,
    fromToken,
    toAddress,
    toAmount,
    toToken,
    isWrapped,
    maxSlippage,
    ignoreExchangeRateCheck,
    ...rest
  }: SwapExchangeDetails) => {
    return [
      ...poolKeys.root(rest),
      'swapExchangeDetails',
      isFrom,
      fromAmount,
      fromAddress,
      fromToken,
      toAddress,
      toAmount,
      toToken,
      isWrapped,
      maxSlippage,
      ignoreExchangeRateCheck,
    ] as const
  },
  swapApproval: ({ isWrapped, fromAddress, toAddress, fromAmount, maxSlippage, ...rest }: SwapApproval) => {
    return [
      ...poolKeys.signerBase(rest),
      'swapApproval',
      isWrapped,
      fromAddress,
      toAddress,
      fromAmount,
      maxSlippage,
    ] as const
  },
  swapEstGas: ({ isApproved, isWrapped, fromAddress, toAddress, fromAmount, maxSlippage, ...rest }: SwapEstGas) => {
    return [
      ...poolKeys.signerBase(rest),
      'swapEstGas',
      isApproved,
      isWrapped,
      fromAddress,
      toAddress,
      fromAmount,
      maxSlippage,
    ] as const
  },

  // mutation
  approveSwap: ({ isWrapped, fromAmount, fromAddress, ...rest }: ApproveSwap) => {
    return [...poolKeys.signerBase(rest), 'approveSwap', isWrapped, fromAmount, fromAddress] as const
  },
  swap: ({ isWrapped, fromAmount, fromAddress, toAddress, maxSlippage, ...rest }: Swap) => {
    return [...poolKeys.signerBase(rest), 'swap', isWrapped, fromAmount, fromAddress, toAddress, maxSlippage] as const
  },
}
