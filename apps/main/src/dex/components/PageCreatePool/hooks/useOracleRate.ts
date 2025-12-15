import { type Address } from 'viem'
import { useReadContract } from 'wagmi'

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

const DECIMALS_ABI = [
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
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
    isFetching: isLoading,
    isSuccess,
    error,
  } = useReadContract({
    address,
    abi: buildOracleAbi(cleanFunctionName),
    functionName: cleanFunctionName,
    query: { enabled: enabled && !!address && !!cleanFunctionName, retry: false },
  })

  const { data: decimals } = useReadContract({
    address,
    abi: DECIMALS_ABI,
    functionName: 'decimals',
    query: { enabled: enabled && !!address && isSuccess, retry: false },
  })

  return {
    rate: rate?.toString(),
    decimals: decimals !== undefined ? Number(decimals) : undefined,
    isLoading,
    isSuccess,
    error,
  }
}
