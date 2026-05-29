import { useMemo } from 'react'
import { ethAddress } from 'viem'
import { useChainId } from 'wagmi'
import { networks } from '@/dao/networks'
import { calculateGas, useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

export const useEstimateGasConversion = (gas: number | null | undefined) => {
  const chainId = useChainId()
  const { data: chainTokenUsdRate } = useTokenUsdRate({ chainId, tokenAddress: ethAddress })

  const network = networks[chainId]
  const { data: gasInfo } = useGasInfoAndUpdateLib({ chainId, networks })

  return useMemo(
    () => calculateGas(gas, gasInfo, chainTokenUsdRate, network),
    [gas, network, gasInfo, chainTokenUsdRate],
  )
}
