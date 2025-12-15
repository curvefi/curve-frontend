import { isAddress, type Address } from 'viem'
import { useOracleRate } from '@/dex/components/PageCreatePool/hooks/useOracleRate'
import { TokenState } from '@/dex/components/PageCreatePool/types'
import { validateOracleFunction } from '@/dex/components/PageCreatePool/utils'

type UseOracleValidationParams = {
  token: TokenState
}

/**
 * This hook validates oracle configuration and returns the results
 */
export const useOracleValidation = ({ token }: UseOracleValidationParams) => {
  const oracleAddress = token.oracle.address
  const oracleFunction = token.oracle.functionName

  const hasValidAddress = oracleAddress.length === 42 && isAddress(oracleAddress)
  const hasValidFunction = oracleFunction !== '' && validateOracleFunction(oracleFunction)
  const enabled = hasValidAddress && hasValidFunction

  return useOracleRate({
    address: oracleAddress as Address,
    functionName: oracleFunction,
    enabled,
  })
}
