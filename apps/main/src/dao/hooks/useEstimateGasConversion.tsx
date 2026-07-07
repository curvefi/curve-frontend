import { useCallback } from 'react'
import { ethAddress } from 'viem'
import { useChainId } from 'wagmi'
import { networks } from '@/dao/networks'
import { useCombinedQueries } from '@ui-kit/lib'
import { calculateGas, useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { type Query } from '@ui-kit/types/util'

export const useEstimateGasConversion = (gas: Query<number | null>) => {
  const chainId = useChainId()
  const chainTokenUsdRate = useTokenUsdRate({ chainId, tokenAddress: ethAddress })
  const network = networks[chainId]
  const gasInfo = useGasInfoAndUpdateLib({ chainId, networks })

  return useCombinedQueries(
    [gas, chainTokenUsdRate, gasInfo],
    useCallback((gas, chainTokenUsdRate, gasInfo) => calculateGas(gas, gasInfo, chainTokenUsdRate, network), [network]),
  )
}
