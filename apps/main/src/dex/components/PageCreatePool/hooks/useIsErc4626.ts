import { erc4626Abi, type Address } from 'viem'
import { useReadContract } from 'wagmi'

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
