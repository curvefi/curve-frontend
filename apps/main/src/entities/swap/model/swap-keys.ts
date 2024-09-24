import type {
  PoolBase,
  PoolSignerBase,
  ApproveSwap,
  Swap,
  SwapExchangeDetails,
  SwapEstGasApproval,
} from '@/entities/swap'

export const swapKeys = {
  base: ({ chainId, poolId }: PoolBase) => {
    return ['swapBase', chainId, poolId] as const
  },
  signerBase: ({ chainId, signerAddress, poolId }: PoolSignerBase) => {
    return ['swapSignerBase', chainId, signerAddress, poolId] as const
  },

  // query
  ignoreExchangeRateCheck: (params: PoolBase) => {
    return ['ignoreExchangeRateCheck', ...swapKeys.base(params)] as const
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
      'swapExchangeDetails',
      ...swapKeys.base(rest),
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
  swapEstGasApproval: ({ isWrapped, fromAddress, toAddress, fromAmount, maxSlippage, ...rest }: SwapEstGasApproval) => {
    return [
      'swapEstGasApproval',
      ...swapKeys.signerBase(rest),
      isWrapped,
      fromAddress,
      toAddress,
      fromAmount,
      maxSlippage,
    ] as const
  },

  // mutation
  approveSwap: ({ isWrapped, fromAmount, fromAddress, ...rest }: ApproveSwap) => {
    return ['approveSwap', ...swapKeys.signerBase(rest), isWrapped, fromAmount, fromAddress] as const
  },
  swap: ({ isWrapped, fromAmount, fromAddress, toAddress, maxSlippage, ...rest }: Swap) => {
    return ['swap', ...swapKeys.signerBase(rest), isWrapped, fromAmount, fromAddress, toAddress, maxSlippage] as const
  },
}
