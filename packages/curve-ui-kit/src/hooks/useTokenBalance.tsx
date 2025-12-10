import { useMemo } from 'react'
import { type Address, erc20Abi, ethAddress, formatUnits, zeroAddress } from 'viem'
import { useConfig } from 'wagmi'
import { useBalance, useReadContracts } from 'wagmi'
import type { FieldsOf } from '@ui-kit/lib'
import type { Query } from '@ui-kit/types/util'
import { Decimal } from '@ui-kit/utils'
import type { GetBalanceReturnType } from '@wagmi/core'

/** Convert user collateral from GetBalanceReturnType to number */
const convertBalance = ({ value, decimals }: Partial<GetBalanceReturnType>) =>
  formatUnits(value || 0n, decimals || 18) as Decimal

export function useChainConfig(chainId: number | null | undefined) {
  const config = useConfig()
  return useMemo(() => config.chains.find((chain) => chain.id === chainId), [config.chains, chainId])
}

/**
 * Hook to fetch the token balance and convert it to a number, wrapping wagmi's useBalance and useReadContracts.
 * The useBalance hook is used for native tokens, while useReadContracts is used for ERC-20 tokens.
 * @param chainId The ID of the blockchain network.
 * @param userAddress The address of the user whose balance is to be fetched.
 * @param token The token object containing its address. If the address is the Ethereum address, it fetches the native balance.
 * @returns An object containing the balance data (Decimal type), loading state, and error.
 */
export function useTokenBalance(
  { chainId, userAddress }: FieldsOf<{ chainId: number; userAddress: Address }>,
  token: { address: Address; symbol?: string } | undefined,
): Query<Decimal> {
  const nativeCurrencySymbol = useChainConfig(chainId)?.nativeCurrency.symbol
  const isNative = token?.address == ethAddress || token?.symbol === nativeCurrencySymbol
  const {
    data: nativeBalanceData,
    error: nativeBalanceError,
    isLoading: nativeBalanceLoading,
  } = useBalance({
    ...(isNative && userAddress && chainId && { address: userAddress, chainId }),
  })

  const tokenAddress = isNative ? undefined : token?.address
  const {
    data: tokenBalanceData,
    error: tokenBalanceError,
    isLoading: tokenBalanceLoading,
  } = useReadContracts({
    allowFailure: false,
    contracts: [
      { address: tokenAddress, abi: erc20Abi, functionName: 'balanceOf', args: [userAddress ?? zeroAddress] },
      { address: tokenAddress, abi: erc20Abi, functionName: 'decimals' },
    ],
  })

  return isNative
    ? {
        data: nativeBalanceData && convertBalance(nativeBalanceData),
        error: nativeBalanceError,
        isLoading: nativeBalanceLoading,
      }
    : {
        data: tokenBalanceData && convertBalance({ value: tokenBalanceData[0], decimals: tokenBalanceData[1] }),
        error: tokenBalanceError,
        isLoading: tokenBalanceLoading,
      }
}
