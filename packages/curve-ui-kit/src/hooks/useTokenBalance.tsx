import { type Address, ethAddress, formatUnits } from 'viem'
import { useBalance } from 'wagmi'
import type { FieldsOf } from '@ui-kit/lib'
import { Decimal } from '@ui-kit/utils'
import type { GetBalanceReturnType } from '@wagmi/core'

/** Convert user collateral from GetBalanceReturnType to number */
const convertBalance = ({ value, decimals }: Partial<GetBalanceReturnType>) =>
  formatUnits(value || 0n, decimals || 18) as Decimal

/**
 * Hook to fetch the token balance and convert it to a number, wrapping wagmi's useBalance hook.
 * @param chainId The ID of the blockchain network.
 * @param userAddress The address of the user whose balance is to be fetched.
 * @param token The token object containing its address. If the address is the Ethereum address, it fetches the native balance.
 * @returns An object containing the balance data (as a number), loading state, and error state.
 */
export function useTokenBalance(
  { chainId, userAddress }: FieldsOf<{ chainId: number; userAddress: Address }>,
  token: { address: Address } | undefined,
) {
  const { data, error, isLoading } = useBalance({
    ...(userAddress && { address: userAddress }),
    ...(chainId && { chainId: chainId }),
    ...(token && token.address != ethAddress && { token: token.address }),
  })
  return { ...(data && { data: convertBalance(data) }), error, isLoading }
}
