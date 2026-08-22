import { type Address, erc20Abi } from 'viem'
import { useReadContract } from 'wagmi'
import type { FieldsOf } from '@ui-kit/lib'
import type { ChainQuery } from '@ui-kit/lib/model'

type TokenDecimalsQuery = ChainQuery & { tokenAddress: Address }

/** Fetch ERC-20 token decimals for a token on a specific chain. */
export const useTokenDecimals = ({ chainId, tokenAddress }: FieldsOf<TokenDecimalsQuery>, enabled = true) =>
  useReadContract({
    chainId: chainId ?? undefined,
    address: tokenAddress ?? undefined,
    abi: erc20Abi,
    functionName: 'decimals',
    query: {
      enabled: enabled && chainId != null && tokenAddress != null,
    },
  })
