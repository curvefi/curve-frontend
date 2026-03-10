import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import type { Query } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
/** Converts an amount from one token to another using USD rates as an intermediary. */
export function useTokenAmountConversion({
  chainId,
  amountIn,
  tokenInAddress,
  tokenOutAddress,
}: {
  chainId: number | null | undefined
  amountIn: Query<Decimal>
  tokenInAddress: Address | undefined
  tokenOutAddress: Address | undefined
}) {
  const {
    data: tokenInUsdRate,
    isLoading: tokenInUsdRateLoading,
    error: tokenInUsdRateError,
  } = useTokenUsdRate({
    chainId,
    tokenAddress: tokenInAddress,
  })

  const {
    data: tokenOutUsdRate,
    isLoading: tokenOutUsdRateLoading,
    error: tokenOutUsdRateError,
  } = useTokenUsdRate({
    chainId,
    tokenAddress: tokenOutAddress,
  })

  return {
    data: useMemo(
      () =>
        tokenInUsdRate && tokenOutUsdRate && amountIn.data
          ? decimal(BigNumber(amountIn.data).times(tokenInUsdRate).div(tokenOutUsdRate))
          : undefined,
      [amountIn, tokenInUsdRate, tokenOutUsdRate],
    ),
    isLoading: tokenInUsdRateLoading || tokenOutUsdRateLoading || amountIn.isLoading,
    error: tokenInUsdRateError ?? tokenOutUsdRateError ?? amountIn.error,
  }
}
