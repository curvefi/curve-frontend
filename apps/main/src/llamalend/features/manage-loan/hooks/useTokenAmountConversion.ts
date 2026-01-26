import { useMemo } from 'react'
import type { Address } from 'viem'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { decimal, type Decimal } from '@ui-kit/utils'

/** Converts an amount from one token to another using USD rates as an intermediary. */
export function useTokenAmountConversion({
  chainId,
  amountIn,
  tokenInAddress,
  tokenOutAddress,
}: {
  chainId?: number
  amountIn?: Decimal
  tokenInAddress?: Address
  tokenOutAddress?: Address
}) {
  const { data: tokenInUsdRate, isLoading: tokenInUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: tokenInAddress,
  })

  const { data: tokenOutUsdRate, isLoading: tokenOutUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: tokenOutAddress,
  })

  const amountOut = useMemo(
    () => (tokenInUsdRate && tokenOutUsdRate && amountIn ? (+amountIn * tokenInUsdRate) / tokenOutUsdRate : undefined),
    [amountIn, tokenInUsdRate, tokenOutUsdRate],
  )

  return {
    data: decimal(amountOut),
    isLoading: tokenInUsdRateLoading || tokenOutUsdRateLoading,
  }
}
