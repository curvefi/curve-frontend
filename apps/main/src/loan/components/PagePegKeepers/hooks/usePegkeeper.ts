import { formatEther } from 'viem'
import { useReadContract, useWriteContract, useSimulateContract } from 'wagmi'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { q } from '@ui-kit/types/util'
import { abi as pegkeeperAbi } from '../abi/pegkeeper'
import { abi as pegkeeperDebtCeilingAbi } from '../abi/pegkeeperDebtCeiling'
import { abi as priceOracleAbi, abiFallback as priceOracleFallbackAbi } from '../abi/priceOracle'
import { PEG_KEEPER_DEBT_CEILINGS_CONTRACT_ADDRESS } from '../constants'
import type { PegKeeper } from '../types'

const formatWei = (value: bigint) => formatEther(value) as Decimal

export function usePegkeeper({ address, pool: { address: poolAddress } }: PegKeeper) {
  const {
    data: debt,
    error: debtError,
    isLoading: isLoadingDebt,
    refetch: refetchDebt,
  } = useReadContract({
    abi: pegkeeperAbi,
    address,
    functionName: 'debt',
  })

  // There's an `estimate_caller_profit` view function in the abi, but it's very inaccurate (by design)
  // However, if this function fails we fall back to it (could be when no wallet is connected)
  const {
    data: estCallerProfit,
    refetch: refetchEstCallerProfit,
    error: estCallerProfitError,
    isLoading: isLoadingEstCallerProfit,
    isEnabled: estCallerProfitEnabled,
  } = useSimulateContract({
    abi: pegkeeperAbi,
    address,
    functionName: 'update',
    query: {
      retry: false, // If it fails it's most likely because the profit is actually zero
    },
  })

  const {
    data: estCallerProfitFallback,
    error: estCallerProfitFallbackError,
    isLoading: isLoadingEstCallerProfitFallback,
  } = useReadContract({
    abi: pegkeeperAbi,
    address,
    functionName: 'estimate_caller_profit',
    query: { enabled: !estCallerProfitEnabled || !!estCallerProfitError },
  })

  const {
    data: debtCeiling,
    error: debtCeilingError,
    isLoading: isLoadingDebtCeiling,
  } = useReadContract({
    abi: pegkeeperDebtCeilingAbi,
    address: PEG_KEEPER_DEBT_CEILINGS_CONTRACT_ADDRESS,
    functionName: 'debt_ceiling',
    args: [address],
  })

  const {
    data: priceOracle,
    error: priceOracleReadError,
    isError: priceOracleError,
    isLoading: isLoadingPriceOracle,
    refetch: refetchPriceOracle,
  } = useReadContract({
    abi: priceOracleAbi,
    address: poolAddress,
    functionName: 'price_oracle',
    query: {
      retry: false, // Don't retry with a delay, immediately use the fallback option
    },
  })

  // Some pools might use a different price oracle function.
  const {
    data: priceOracleFallback,
    error: priceOracleFallbackError,
    isLoading: isLoadingPriceOracleFallback,
    refetch: refetchPriceOracleFallback,
  } = useReadContract({
    abi: priceOracleFallbackAbi,
    address: poolAddress,
    functionName: 'price_oracle',
    args: [0n],
    query: {
      enabled: priceOracleError,
      retry: false, // No point in retrying multiple times. If it fails it's prob not supported.
    },
  })

  const shouldUseEstCallerProfitFallback = !estCallerProfitEnabled || !!estCallerProfitError
  const shouldUsePriceOracleFallback = priceOracleError

  const refetch = async () => {
    const [, , newPriceOracle] = await Promise.all([refetchDebt(), refetchEstCallerProfit(), refetchPriceOracle()])

    if (newPriceOracle.error) {
      await refetchPriceOracleFallback()
    }
  }

  const { mutate, isPending: isRebalancing } = useWriteContract()

  const rebalance = () =>
    mutate(
      {
        abi: pegkeeperAbi,
        address,
        functionName: 'update',
      },
      // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Existing violation before enabling this rule.
      { onSuccess: refetch },
    )

  return {
    rate: q({
      data: priceOracle === undefined ? maybe(priceOracleFallback, formatWei) : formatWei(priceOracle),
      isLoading: isLoadingPriceOracle || (shouldUsePriceOracleFallback && isLoadingPriceOracleFallback),
      error: shouldUsePriceOracleFallback ? (priceOracleFallbackError ?? priceOracleReadError) : priceOracleReadError,
    }),
    debt: q({
      data: maybe(debt, formatWei),
      isLoading: isLoadingDebt,
      error: debtError,
    }),
    estCallerProfit: q(
      shouldUseEstCallerProfitFallback
        ? {
            data: maybe(estCallerProfitFallback, formatWei),
            isLoading: isLoadingEstCallerProfitFallback,
            error: estCallerProfitFallbackError,
          }
        : {
            data: maybe(estCallerProfit?.result, formatWei),
            isLoading: isLoadingEstCallerProfit,
            error: estCallerProfitError,
          },
    ),
    debtCeiling: q({
      data: maybe(debtCeiling, formatWei),
      isLoading: isLoadingDebtCeiling,
      error: debtCeilingError,
    }),
    rebalance,
    isRebalancing,
  }
}
