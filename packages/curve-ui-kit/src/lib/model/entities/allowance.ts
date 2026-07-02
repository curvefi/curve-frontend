import { erc20Abi, maxUint256 } from 'viem'
import type { Address } from '@primitives/address.utils'
import { queryClient } from '@ui-kit/lib/api'
import type { ChainQuery, UserQuery } from '@ui-kit/lib/model'
import type { Config } from '@wagmi/core'
import { writeContract } from '@wagmi/core'
import { readContractQueryOptions } from '@wagmi/core/query'

type AllowanceQuery = ChainQuery & UserQuery & { tokenAddress: Address; spenderAddress: Address }

/**
 * Fetch the current ERC-20 allowance for `userAddress -> spenderAddress`.
 *
 * Uses a staletime of 0 to always be guaranteed of a fresh result.
 * The value returned is in raw token units, as returned by the token contract.
 */
const fetchAllowance = async (config: Config, { chainId, spenderAddress, tokenAddress, userAddress }: AllowanceQuery) =>
  await queryClient.fetchQuery({
    ...readContractQueryOptions(config, {
      chainId,
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [userAddress, spenderAddress],
    }),
    staleTime: 0,
  })

/** Helper function for @see {@link fetchAllowance} that checks if the allowance is sufficient for a given amount. */
export const fetchHasEnoughAllowance = async (config: Config, params: AllowanceQuery & { amount: bigint }) =>
  params.amount <= 0n || (await fetchAllowance(config, params)) >= params.amount

/** Approve `spenderAddress` to spend an ERC-20 token. Defaults to an unlimited approval (not recommended) */
export const approve = async (
  config: Config,
  {
    amount = maxUint256,
    chainId,
    spenderAddress,
    tokenAddress,
  }: { amount?: bigint; chainId: number; spenderAddress: Address; tokenAddress: Address },
) => [
  await writeContract(config, {
    chainId,
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'approve',
    args: [spenderAddress, amount],
  }),
]
