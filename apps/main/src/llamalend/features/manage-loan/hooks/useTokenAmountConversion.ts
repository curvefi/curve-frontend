import { BigNumber } from 'bignumber.js'
import { useMemo } from 'react'
import { useTokenUsdRate } from '@evm-ui/lib/model/entities/token-usd-rate'
import { decimal } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { Query } from '@ui/features/queries/util'
/** Converts an amount from one token to another using USD rates as an intermediary. */
export function useTokenAmountConversion({
  chainId,
  amountIn: { data: amountIn, error: amountError, isLoading: isAmountLoading },
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
        tokenInUsdRate &&
        tokenOutUsdRate &&
        amountIn &&
        decimal(BigNumber(amountIn).times(tokenInUsdRate).div(tokenOutUsdRate)),
      [amountIn, tokenInUsdRate, tokenOutUsdRate],
    ),
    isLoading: tokenInUsdRateLoading || tokenOutUsdRateLoading || isAmountLoading,
    error: tokenInUsdRateError ?? tokenOutUsdRateError ?? amountError,
  }
}
