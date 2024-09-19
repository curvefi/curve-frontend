import type {
  PoolBase,
  PoolSignerBase,
  ApproveSwap,
  Swap,
  SwapExchangeDetails,
  SwapEstGasApproval,
} from '@/entities/swap'

export const keys = {
  base: ({ chainId, poolId }: PoolBase) => {
    return ['swapBase', chainId, poolId] as const
  },
  signerBase: ({ chainId, signerAddress, poolId }: PoolSignerBase) => {
    return ['swapSignerBase', chainId, signerAddress, poolId] as const
  },

  // query
  ignoreExchangeRateCheck: (params: PoolBase) => {
    return ['ignoreExchangeRateCheck', ...keys.base(params)] as const
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
      ...keys.base(rest),
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
      ...keys.signerBase(rest),
      isWrapped,
      fromAddress,
      toAddress,
      fromAmount,
      maxSlippage,
    ] as const
  },

  // mutation
  approveSwap: ({ isWrapped, fromAmount, fromAddress, ...rest }: ApproveSwap) => {
    return ['approveSwap', ...keys.signerBase(rest), isWrapped, fromAmount, fromAddress] as const
  },
  swap: ({ isWrapped, fromAmount, fromAddress, toAddress, maxSlippage, ...rest }: Swap) => {
    return ['swap', ...keys.signerBase(rest), isWrapped, fromAmount, fromAddress, toAddress, maxSlippage] as const
  },
}
