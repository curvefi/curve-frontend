import { formatEther } from 'viem'
import { useReadContract, useWriteContract, useSimulateContract } from 'wagmi'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
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
      : maybe(priceOracleFallback, priceOracleFallback => formatEther(priceOracleFallback))

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
    rate,

    debt: maybe(debt, debt => formatEther(debt) as Decimal),
    estCallerProfit:
      !estCallerProfitEnabled || estCallerProfitError
        ? maybe(estCallerProfitFallback, estCallerProfitFallback => formatEther(estCallerProfitFallback) as Decimal)
        : maybe(estCallerProfit?.result, data => formatEther(data) as Decimal),

    debtCeiling: maybe(debtCeiling, debtCeiling => formatEther(debtCeiling) as Decimal),
    rebalance,
    isRebalancing,
  }
}
