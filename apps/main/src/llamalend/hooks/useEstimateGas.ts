import { useMemo } from 'react'
import { ethAddress } from 'viem'
import { type NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { calculateGas, useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

type EstimatedGasValue = number | number[] | null | undefined

export type GasEstimateConversionResult = ReturnType<typeof calculateGas>

export const useEstimateGas = <
  ChainId extends IChainId,
  TEstimates extends Record<string, EstimatedGasValue> | undefined,
>(
  networks: NetworkDict<ChainId>,
  chainId: ChainId | null | undefined,
  estimates: TEstimates,
  enabled?: boolean,
) => {
  const network = chainId && networks[chainId]
  const { data: ethRate, isLoading: ethRateLoading } = useTokenUsdRate({ chainId, tokenAddress: ethAddress }, enabled)
  const { data: gasInfo, isLoading: gasInfoLoading } = useGasInfoAndUpdateLib<ChainId>({ chainId, networks }, enabled)

  const data = useMemo(() => {
    if (!network || !estimates) {
      return {} as { [K in keyof NonNullable<TEstimates>]?: GasEstimateConversionResult }
    }

    const entries = Object.entries(estimates as Record<string, EstimatedGasValue>).map(([key, value]) => [
      key,
      calculateGas(value, gasInfo, ethRate, network),
    ])
    return Object.fromEntries(entries) as {
      [K in keyof NonNullable<TEstimates>]?: GasEstimateConversionResult
    }
  }, [estimates, network, gasInfo, ethRate])

  return { data, isLoading: ethRateLoading || gasInfoLoading }
}
