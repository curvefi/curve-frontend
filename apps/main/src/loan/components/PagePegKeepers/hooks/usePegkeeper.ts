import { formatEther } from 'viem'
import { useReadContract, useSimulateContract, useWriteContract } from 'wagmi'
import type { Decimal } from '@primitives/decimal.utils'
import { fallbackQ, mapQuery } from '@ui-kit/types/util'
import { abi as pegkeeperAbi } from '../abi/pegkeeper'
import { abi as pegkeeperDebtCeilingAbi } from '../abi/pegkeeperDebtCeiling'
import { abi as priceOracleAbi, abiFallback as priceOracleFallbackAbi } from '../abi/priceOracle'
import { PEG_KEEPER_DEBT_CEILINGS_CONTRACT_ADDRESS } from '../constants'
import type { PegKeeper } from '../types'

const formatWei = (value: bigint) => formatEther(value) as Decimal

export function usePegkeeper({ address, pool: { address: poolAddress } }: PegKeeper) {
  const debt = useReadContract({
    abi: pegkeeperAbi,
    address,
    functionName: 'debt',
  })

  // There's an `estimate_caller_profit` view function in the abi, but it's very inaccurate (by design)
  // However, if this function fails we fall back to it (could be when no wallet is connected)
  const estCallerProfit = useSimulateContract({
    abi: pegkeeperAbi,
    address,
    functionName: 'update',
    query: { retry: false }, // If it fails it's most likely because the profit is actually zero
  })

  const estCallerProfitFallback = useReadContract({
    abi: pegkeeperAbi,
    address,
    functionName: 'estimate_caller_profit',
    query: { enabled: !!estCallerProfit.error },
  })

  const debtCeiling = useReadContract({
    abi: pegkeeperDebtCeilingAbi,
    address: PEG_KEEPER_DEBT_CEILINGS_CONTRACT_ADDRESS,
    functionName: 'debt_ceiling',
    args: [address],
  })

  const priceOracle = useReadContract({
    abi: priceOracleAbi,
    address: poolAddress,
    functionName: 'price_oracle',
    query: { retry: false }, // Don't retry with a delay, immediately use the fallback option
  })

  // Some pools might use a different price oracle function.
  const priceOracleFallback = useReadContract({
    abi: priceOracleFallbackAbi,
    address: poolAddress,
    functionName: 'price_oracle',
    args: [0n],
    query: { enabled: !!priceOracle.error, retry: false }, // No point in retrying, if it fails it's prob not supported
  })

  const refetch = async () => {
    const [newPriceOracle, profit] = await Promise.all([
      priceOracle.refetch(),
      estCallerProfit.refetch(),
      debt.refetch(),
    ])
    if (newPriceOracle.error) await priceOracleFallback.refetch()
    if (profit.error) await estCallerProfitFallback.refetch()
  }

  const { mutate, isPending: isRebalancing } = useWriteContract()

  return {
    rate: fallbackQ(mapQuery(priceOracle, formatWei), mapQuery(priceOracleFallback, formatWei)),
    debt: mapQuery(debt, formatWei),
    estCallerProfit: fallbackQ(
      mapQuery(estCallerProfit, p => formatWei(p.result)),
      mapQuery(estCallerProfitFallback, formatWei),
    ),
    debtCeiling,
    rebalance: () =>
      mutate({ abi: pegkeeperAbi, address, functionName: 'update' }, { onSuccess: () => void refetch() }),
    isRebalancing,
  }
}
