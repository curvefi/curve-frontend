import { useMemo } from 'react'
import { ethAddress } from 'viem'
import { type NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { calculateGas, useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

type EstimatedGasValue = number | number[] | null | undefined

export type GasEstimateConversionResult = ReturnType<typeof calculateGas>

export const useEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  chainId: ChainId | null | undefined,
  estimate: EstimatedGasValue,
  enabled?: boolean,
) => {
  const network = chainId && networks[chainId]
  const {
    data: ethRate,
    isLoading: ethRateLoading,
    error: ethRateError,
  } = useTokenUsdRate({ chainId, tokenAddress: ethAddress }, enabled)
  const {
    data: gasInfo,
    isLoading: gasInfoLoading,
    error: gasInfoError,
  } = useGasInfoAndUpdateLib<ChainId>({ chainId, networks }, enabled)

  const data = useMemo(() => {
    if (!network || estimate == null) {
      return undefined as GasEstimateConversionResult | undefined
    }

    return calculateGas(estimate, gasInfo, ethRate, network)
  }, [estimate, network, gasInfo, ethRate])

  return { data, isLoading: ethRateLoading || gasInfoLoading, error: ethRateError ?? gasInfoError }
}
