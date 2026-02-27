import { erc4626Abi } from 'viem'
import { useReadContract } from 'wagmi'
import type { Address } from '@primitives/address.utils'

export function useIsErc4626({ address }: { address?: Address }) {
  const {
    data: assetAddress,
    isFetching: isLoading,
    isSuccess,
    error,
    refetch,
  } = useReadContract({
    abi: erc4626Abi,
    address,
    functionName: 'asset',
    query: {
      enabled: !!address,
      retry: false,
    },
  })

  return {
    isErc4626: assetAddress && true,
    assetAddress,
    isLoading,
    isSuccess,
    error,
    refetch,
  }
}
