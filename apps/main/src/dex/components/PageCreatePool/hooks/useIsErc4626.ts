import { erc4626Abi, isAddress } from 'viem'
import { useReadContract } from 'wagmi'

type UseIsErc4626Params = {
  address?: string
}

export function useIsErc4626({ address }: UseIsErc4626Params) {
  const isValidAddress = address !== undefined && isAddress(address)

  const {
    data: assetAddress,
    error,
    refetch,
  } = useReadContract({
    abi: erc4626Abi,
    address: isValidAddress ? address : undefined,
    functionName: 'asset',
    query: {
      enabled: isValidAddress,
      retry: false,
    },
  })

  const hasData = assetAddress !== undefined
  const hasError = Boolean(error)

  const isSuccess = isValidAddress && hasData
  const isError = isValidAddress && !hasData && hasError
  const isLoading = isValidAddress && !hasData && !hasError

  const isErc4626 = isSuccess ? true : isError ? false : undefined

  return {
    isErc4626,
    assetAddress,
    isLoading,
    isError,
    isSuccess,
    refetch,
  }
}
