import { useCallback } from 'react'
import { createPublicClient, custom, isAddress, type Address } from 'viem'
import { useWalletClient } from 'wagmi'

type ValidateOracleArgs = {
  address: string
  functionSignature: string
}

type ValidateOracleResult = {
  rate: string
  decimals: number | undefined
}

const DECIMALS_ABI = [
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const

const buildOracleAbi = (functionName: string) =>
  [
    {
      name: functionName,
      type: 'function',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ name: 'rate', type: 'uint256' }],
    },
  ] as const

export const useValidateOracle = () => {
  const { data: walletClient } = useWalletClient()

  const validateOracle = useCallback(
    async ({ address, functionSignature }: ValidateOracleArgs): Promise<ValidateOracleResult> => {
      if (!walletClient) {
        throw new Error('Wallet client unavailable')
      }
      if (!isAddress(address)) {
        throw new Error('Invalid oracle address')
      }

      const functionName = functionSignature.trim()
      if (functionName === '') {
        throw new Error('Invalid oracle function')
      }

      const publicClient = createPublicClient({
        chain: walletClient.chain ?? undefined,
        transport: custom({
          request: walletClient.request,
        }),
      })

      const rateAbi = buildOracleAbi(functionName)
      const rate = await publicClient.readContract({
        address: address as Address,
        abi: rateAbi,
        functionName,
      })

      let decimals: number | undefined
      try {
        const decimalsResult = await publicClient.readContract({
          address: address as Address,
          abi: DECIMALS_ABI,
          functionName: 'decimals',
        })
        decimals = Number(decimalsResult)
      } catch {
        decimals = undefined
      }

      return {
        rate: rate.toString(),
        decimals,
      }
    },
    [walletClient],
  )

  return {
    validateOracle,
  }
}
