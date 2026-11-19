import { erc20Abi } from 'viem'
import { useReadContract } from 'wagmi'
import type { Address } from '@primitives/address.utils'
import { decimal } from '@ui/lib/decimal'

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

type UseOracleRateParams = { address?: Address; functionName?: string; enabled?: boolean }

export function useOracleRate({ address, functionName, enabled }: UseOracleRateParams) {
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
    query: { enabled: !!address && !!cleanFunctionName && enabled, retry: false },
  })

  const { data: decimals, isFetching: isLoadingDecimals } = useReadContract({
    address,
    abi: erc20Abi,
    functionName: 'decimals',
    query: { enabled: !!address && isSuccess && enabled, retry: false },
  })

  return { rate: decimal(rate?.toString()), decimals, isLoading: isLoadingRate || isLoadingDecimals, isSuccess, error }
}
