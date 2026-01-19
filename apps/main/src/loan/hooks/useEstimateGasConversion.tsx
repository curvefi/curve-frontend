import { useMemo } from 'react'
import { ethAddress } from 'viem'
import { useChainId } from 'wagmi'
import { networks } from '@/loan/networks'
import type { ChainId } from '@/loan/types/loan.types'
import { calculateGas, useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

export const useEstimateGasConversion = (gas: number) => {
  const chainId = useChainId() as ChainId
  const network = networks[chainId]
  const { data: chainTokenUsdRate } = useTokenUsdRate({ chainId, tokenAddress: ethAddress })
  const { data: gasInfo } = useGasInfoAndUpdateLib({ chainId, networks })

  return useMemo(
    () => calculateGas(gas, gasInfo, chainTokenUsdRate, network),
    [network, gas, gasInfo, chainTokenUsdRate],
  )
}
