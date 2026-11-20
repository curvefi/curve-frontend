import { type Address, erc20Abi } from 'viem'
import { useReadContract } from 'wagmi'
import type { ChainQuery } from '@evm-ui/queries/query-types'
import type { FieldsOf } from '@ui/lib/validation/types'

type TokenDecimalsQuery = ChainQuery & { tokenAddress: Address }

/** Fetch ERC-20 token decimals for a token on a specific chain. */
export const useTokenDecimals = ({ chainId, tokenAddress }: FieldsOf<TokenDecimalsQuery>, enabled?: boolean) =>
  useReadContract({
    chainId: chainId ?? undefined,
    address: tokenAddress ?? undefined,
    abi: erc20Abi,
    functionName: 'decimals',
    query: { enabled: chainId != null && tokenAddress != null && enabled },
  })
