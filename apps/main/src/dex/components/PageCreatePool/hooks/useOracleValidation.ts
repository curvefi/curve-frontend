import { isAddress, type Address } from 'viem'
import { useReadContract } from 'wagmi'
import { TokenId, TokenState, OracleType } from '@/dex/components/PageCreatePool/types'
import { validateOracleFunction } from '@/dex/components/PageCreatePool/utils'
import { DEFAULT_ORACLE_STATUS } from '@/dex/store/createCreatePoolSlice'
import useStore from '@/dex/store/useStore'

type UseOracleValidationParams = {
  token: TokenState
  tokenId: TokenId
}

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

export const useOracleValidation = ({ token, tokenId }: UseOracleValidationParams) => {
  const updateOracleState = useStore((state) => state.createPool.updateOracleState)

  const oracleAddress = token.oracle.address
  const oracleFunction = token.oracle.functionName

  const hasValidAddress = oracleAddress.length === 42 && isAddress(oracleAddress)
  const hasValidFunction = oracleFunction !== '' && validateOracleFunction(oracleFunction)
  const enabled = hasValidAddress && hasValidFunction

  const cleanFunctionName = oracleFunction.replace('()', '')

  const {
    data: rate,
    isFetching: isRateLoading,
    isSuccess: isRateSuccess,
    error,
  } = useReadContract({
    address: oracleAddress as Address,
    abi: buildOracleAbi(cleanFunctionName),
    functionName: cleanFunctionName,
    query: { enabled, retry: false },
  })

  const { data: decimals } = useReadContract({
    address: oracleAddress as Address,
    abi: DECIMALS_ABI,
    functionName: 'decimals',
    query: { enabled: enabled && isRateSuccess, retry: false },
  })

  // Sync validation results to store during render (same pattern as useAutoDetectErc4626)
  const currentOracle = token.oracle
  const nextRate = rate?.toString()
  const nextDecimals = decimals !== undefined ? Number(decimals) : undefined

  const nextState: OracleType = {
    ...DEFAULT_ORACLE_STATUS,
    address: oracleAddress,
    functionName: oracleFunction,
    isLoading: isRateLoading,
    isSuccess: isRateSuccess,
    error,
    rate: nextRate,
    decimals: nextDecimals,
  }

  const needsUpdate =
    currentOracle.isLoading !== nextState.isLoading ||
    currentOracle.isSuccess !== nextState.isSuccess ||
    currentOracle.error !== nextState.error ||
    currentOracle.rate !== nextState.rate ||
    currentOracle.decimals !== nextState.decimals

  if (enabled && needsUpdate) {
    updateOracleState(tokenId, nextState)
  }

  // Reset state when inputs become invalid
  if (!enabled && (currentOracle.isLoading || currentOracle.isSuccess || currentOracle.error)) {
    updateOracleState(tokenId, { ...DEFAULT_ORACLE_STATUS })
  }

  return {
    isLoading: isRateLoading,
    isSuccess: isRateSuccess,
    error,
    rate: nextRate,
    decimals: nextDecimals,
  }
}
