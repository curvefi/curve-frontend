import { formatEther } from 'viem'
import { useReadContract, useWriteContract, useSimulateContract } from 'wagmi'
import { abi as pegkeeperAbi } from '../abi/pegkeeper'
import { abi as pegkeeperDebtCeilingAbi } from '../abi/pegkeeperDebtCeiling'
import { abi as priceOracleAbi, abiFallback as priceOracleFallbackAbi } from '../abi/priceOracle'
import { PEG_KEEPER_DEBT_CEILINGS_CONTRACT_ADDRESS, query } from '../constants'
import type { PegKeeper } from '../types'

export function usePegkeeper({ address, pool: { address: poolAddress } }: PegKeeper) {
  const { data: debt, refetch: refetchDebt } = useReadContract({
    abi: pegkeeperAbi,
    address,
    functionName: 'debt',
    query,
  })

  // There's an `estimate_caller_profit` view function in the abi, but it's very inaccurate (by design)
  // However, if this function fails we fall back to it (could be when no wallet is connected)
  const {
    data: estCallerProfit,
    refetch: refetchEstCallerProfit,
    isError: estCallerProfitError,
  } = useSimulateContract({
    abi: pegkeeperAbi,
    address,
    functionName: 'update',
    query: {
      ...query,
      retry: false, // If it fails it's most likely because the profit is actually zero
    },
  })

  const { data: estCallerProfitFallback } = useReadContract({
    abi: pegkeeperAbi,
    address,
    functionName: 'estimate_caller_profit',
    query: {
      ...query,
      enabled: estCallerProfitError,
    },
  })

  const { data: debtCeiling } = useReadContract({
    abi: pegkeeperDebtCeilingAbi,
    address: PEG_KEEPER_DEBT_CEILINGS_CONTRACT_ADDRESS,
    functionName: 'debt_ceiling',
    args: [address],
    query,
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
      ...query,
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
      ...query,
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

  const { writeContract, isPending: isRebalancing } = useWriteContract()

  const rebalance = () =>
    writeContract(
      {
        abi: pegkeeperAbi,
        address,
        functionName: 'update',
      },
      { onSuccess: refetch },
    )

  return {
    rate,
    debt: debt !== undefined ? formatEther(debt) : undefined,
    estCallerProfit: estCallerProfitError
      ? estCallerProfitFallback !== undefined
        ? formatEther(estCallerProfitFallback)
        : undefined
      : estCallerProfit?.result !== undefined
        ? formatEther(estCallerProfit.result)
        : undefined,
    debtCeiling: debtCeiling !== undefined ? formatEther(debtCeiling) : undefined,
    rebalance,
    isRebalancing,
  }
}
