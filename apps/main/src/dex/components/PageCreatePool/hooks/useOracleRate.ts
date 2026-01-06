import { type Address, erc20Abi } from 'viem'
import { useReadContract } from 'wagmi'
import { decimal } from '@ui-kit/utils'

const buildOracleAbi = (fnName: string) =>
  [
    {
      name: fnName,
      type: 'function',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ name: 'rate', type: 'uint256' }],
    },
  ] as const

type UseOracleRateParams = {
  address?: Address
  functionName?: string
  enabled?: boolean
}

export function useOracleRate({ address, functionName, enabled = true }: UseOracleRateParams) {
  const cleanFunctionName = functionName?.replace('()', '') ?? ''

  const {
    data: rate,
    isFetching: isLoadingRate,
    isSuccess,
    error,
  } = useReadContract({
    address,
    abi: buildOracleAbi(cleanFunctionName),
    functionName: cleanFunctionName,
    query: { enabled: enabled && !!address && !!cleanFunctionName, retry: false },
  })

  const { data: decimals, isFetching: isLoadingDecimals } = useReadContract({
    address,
    abi: erc20Abi,
    functionName: 'decimals',
    query: { enabled: enabled && !!address && isSuccess, retry: false },
  })

  return {
    rate: decimal(rate?.toString()),
    decimals,
    isLoading: isLoadingRate || isLoadingDecimals,
    isSuccess,
    error,
  }
}
