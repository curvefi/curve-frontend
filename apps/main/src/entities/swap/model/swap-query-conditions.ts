import type { PoolBase, PoolSignerBase, SwapEstGasApproval, SwapExchangeDetails } from '@/entities/swap'

import { isAddress } from 'viem'

export function poolBaseBase({ chainId, poolId }: PoolBase) {
  return !!chainId && !!poolId
}

export function poolSignerBase({ chainId, signerAddress = '', poolId }: PoolSignerBase) {
  return !!chainId && !!poolId && isAddress(signerAddress)
}

export const swapExchangeDetails = ({
  isInProgress,
  isFrom,
  fromAddress,
  fromAmount,
  fromToken,
  toAddress,
  toAmount,
  toToken,
  ignoreExchangeRateCheck,
  tokens,
  ...rest
}: SwapExchangeDetails) => {
  const validAmount = isFrom ? Number(fromAmount) > 0 : Number(toAmount) > 0
  const validFrom = tokens.some((t) => t.address === fromAddress) && !!fromToken
  const validTo = tokens.some((t) => t.address === toAddress) && !!toToken
  const validIgnoreCheck = typeof ignoreExchangeRateCheck !== 'undefined'
  return poolBaseBase(rest) && !isInProgress && validAmount && validFrom && validTo && validIgnoreCheck
}

export const swapEstGasApproval = ({
  fromAddress,
  toAddress,
  fromAmount,
  isInProgress,
  ...rest
}: SwapEstGasApproval) => {
  return poolSignerBase(rest) && !isInProgress && Number(fromAmount) > 0 && !!fromAddress && !!toAddress
}
