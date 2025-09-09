import { useMemo } from 'react'
import { ethAddress } from 'viem'
import { useChainId } from 'wagmi'
import networks from '@/loan/networks'
import type { ChainId } from '@/loan/types/loan.types'
import { calculateGas, useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

const useEstimateGasConversion = (gas: number) => {
  const chainId = useChainId() as ChainId
  const network = networks[chainId]
  const { data: chainTokenUsdRate } = useTokenUsdRate({ chainId, tokenAddress: ethAddress })
  const { data: gasInfo } = useGasInfoAndUpdateLib({ chainId, networks })

  return useMemo(() => {
    if (!chainId) return { estGasCost: 0, estGasCostUsd: 0, tooltip: '' }
    const { estGasCost, estGasCostUsd, tooltip } = calculateGas(gas, gasInfo, chainTokenUsdRate, network)
    return chainTokenUsdRate == null
      ? { estGasCost: estGasCost, estGasCostUsd: 'NaN', tooltip: '' }
      : { estGasCost: estGasCost, estGasCostUsd: estGasCostUsd || 0, tooltip: tooltip || '' }
  }, [chainId, network, gas, gasInfo, chainTokenUsdRate])
}

export default useEstimateGasConversion
