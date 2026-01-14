import { useEffect } from 'react'
import { isAddress, type Address } from 'viem'
import { useOracleRate } from '@/dex/components/PageCreatePool/hooks/useOracleRate'
import { TokenId, TokenState } from '@/dex/components/PageCreatePool/types'
import { validateOracleFunction } from '@/dex/components/PageCreatePool/utils'
import { useStore } from '@/dex/store/useStore'

type UseOracleValidationParams = {
  token: TokenState
  tokenId: TokenId
}

/**
 * This hook validates oracle configuration, syncs results to store, and returns them
 */
export const useOracleValidation = ({ token, tokenId }: UseOracleValidationParams) => {
  const updateOracleState = useStore((state) => state.createPool.updateOracleState)

  const oracleAddress = token.oracle.address
  const oracleFunction = token.oracle.functionName

  const enabled = isAddress(oracleAddress) && validateOracleFunction(oracleFunction)

  const { rate, decimals, isLoading, isSuccess, error } = useOracleRate({
    address: oracleAddress as Address,
    functionName: oracleFunction,
    enabled,
  })

  // Sync to store when query results change
  useEffect(() => {
    updateOracleState(tokenId, {
      address: oracleAddress,
      functionName: oracleFunction,
      isLoading,
      isSuccess,
      error,
      rate,
      decimals,
    })
  }, [tokenId, oracleAddress, oracleFunction, isLoading, isSuccess, error, rate, decimals, updateOracleState])

  return { isLoading, isSuccess, error, rate, decimals }
}
