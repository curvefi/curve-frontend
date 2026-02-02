import { formatEther } from 'viem'
import { useReadContract, useWriteContract, useSimulateContract } from 'wagmi'
import type { Decimal } from '@ui-kit/utils'
import { abi as pegkeeperAbi } from '../abi/pegkeeper'
import { abi as pegkeeperDebtCeilingAbi } from '../abi/pegkeeperDebtCeiling'
import { abi as priceOracleAbi, abiFallback as priceOracleFallbackAbi } from '../abi/priceOracle'
import { PEG_KEEPER_DEBT_CEILINGS_CONTRACT_ADDRESS } from '../constants'
import type { PegKeeper } from '../types'

export function usePegkeeper({ address, pool: { address: poolAddress } }: PegKeeper) {
  const { data: debt, refetch: refetchDebt } = useReadContract({
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
    isEnabled: estCallerProfitEnabled,
  } = useSimulateContract({
    abi: pegkeeperAbi,
    address,
    functionName: 'update',
    query: {
      retry: false, // If it fails it's most likely because the profit is actually zero
    },
  })

  const { data: estCallerProfitFallback } = useReadContract({
    abi: pegkeeperAbi,
    address,
    functionName: 'estimate_caller_profit',
    query: {
      enabled: !estCallerProfitEnabled || !!estCallerProfitError,
    },
  })

  const { data: debtCeiling } = useReadContract({
    abi: pegkeeperDebtCeilingAbi,
    address: PEG_KEEPER_DEBT_CEILINGS_CONTRACT_ADDRESS,
    functionName: 'debt_ceiling',
    args: [address],
  })

  const {
    data: priceOracle,
    isError: priceOracleError,
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
  const { data: priceOracleFallback, refetch: refetchPriceOracleFallback } = useReadContract({
    abi: priceOracleFallbackAbi,
    address: poolAddress,
    functionName: 'price_oracle',
    args: [0n],
    query: {
      enabled: priceOracleError,
      retry: false, // No point in retrying multiple times. If it fails it's prob not supported.
    },
  })

  const rate =
    priceOracle !== undefined
      ? formatEther(priceOracle)
      : priceOracleFallback !== undefined
        ? formatEther(priceOracleFallback)
        : undefined

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
      { onSuccess: refetch },
    )

  return {
    rate,
    debt: debt == null ? undefined : (formatEther(debt) as Decimal),
    estCallerProfit:
      !estCallerProfitEnabled || estCallerProfitError
        ? estCallerProfitFallback == null
          ? undefined
          : (formatEther(estCallerProfitFallback) as Decimal)
        : estCallerProfit?.result == null
          ? undefined
          : (formatEther(estCallerProfit.result) as Decimal),
    debtCeiling: debtCeiling == null ? undefined : (formatEther(debtCeiling) as Decimal),
    rebalance,
    isRebalancing,
  }
}
