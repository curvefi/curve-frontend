import { erc20Abi, ethAddress, formatUnits, isAddressEqual, type Address } from 'viem'
import { useConfig } from 'wagmi'
import { useBalance, useReadContracts } from 'wagmi'
import type { FieldsOf } from '@ui-kit/lib'
import { queryClient } from '@ui-kit/lib/api'
import type { ChainQuery, UserQuery } from '@ui-kit/lib/model'
import { Decimal } from '@ui-kit/utils'
import type { Config } from '@wagmi/core'
import type { GetBalanceReturnType } from '@wagmi/core'
import { getBalanceQueryOptions, readContractsQueryOptions } from '@wagmi/core/query'

type TokenQuery = { tokenAddress: Address }

/** Convert user collateral from GetBalanceReturnType to number */
const convertBalance = ({ value, decimals }: Partial<GetBalanceReturnType>) =>
  formatUnits(value || 0n, decimals || 18) as Decimal

/** Create query options for native token balance */
const getNativeBalanceQueryOptions = (config: Config, { chainId, userAddress }: ChainQuery & UserQuery) =>
  getBalanceQueryOptions(config, {
    chainId,
    address: userAddress,
  })

/** Create query contracts for ERC-20 token balance and decimals */
const getERC20QueryContracts = ({ chainId, userAddress, tokenAddress }: ChainQuery & UserQuery & TokenQuery) =>
  [
    { chainId, address: tokenAddress, abi: erc20Abi, functionName: 'balanceOf', args: [userAddress] },
    { chainId, address: tokenAddress, abi: erc20Abi, functionName: 'decimals' },
  ] as const

/** In the Curve ecosystem all native chain gas tokens are the 0xeee...eee address */
const isNative = ({ tokenAddress }: TokenQuery) => isAddressEqual(tokenAddress, ethAddress)

/** Imperatively fetch token balance. Uses a staletime of 0 to always be guaranteed of a fresh result. */
export const fetchTokenBalance = async (config: Config, query: ChainQuery & UserQuery & TokenQuery) =>
  isNative(query)
    ? await queryClient
        .fetchQuery({ ...getNativeBalanceQueryOptions(config, query), staleTime: 0 })
        .then((balance) => convertBalance({ value: balance.value, decimals: balance.decimals }))
    : await queryClient
        .fetchQuery({
          ...readContractsQueryOptions(config, {
            allowFailure: false,
            contracts: getERC20QueryContracts(query),
          }),
          staleTime: 0,
        })
        .then((balance) => convertBalance({ value: balance[0], decimals: balance[1] }))

/** Hook to fetch the token balance */
export function useTokenBalance({ chainId, userAddress, tokenAddress }: FieldsOf<ChainQuery & UserQuery & TokenQuery>) {
  const config = useConfig()

  const isEnabled = chainId != null && userAddress != null && tokenAddress != null
  const isNativeToken = isEnabled && isNative({ tokenAddress })

  const nativeBalance = useBalance({
    ...(isEnabled ? getNativeBalanceQueryOptions(config, { chainId, userAddress }) : {}),
    query: { enabled: isEnabled && isNativeToken },
  })

  const erc20Balance = useReadContracts({
    contracts: isEnabled ? getERC20QueryContracts({ chainId, userAddress, tokenAddress }) : undefined,
    query: { enabled: isEnabled && !isNativeToken },
  })

  return isNativeToken
    ? {
        data: nativeBalance.data && convertBalance(nativeBalance.data),
        error: nativeBalance.error,
        isLoading: nativeBalance.isLoading,
      }
    : {
        data:
          erc20Balance.data && erc20Balance.data[0].status === 'success' && erc20Balance.data[1].status === 'success'
            ? convertBalance({
                value: erc20Balance.data[0].result,
                decimals: erc20Balance.data[1].result,
              })
            : undefined,
        error: erc20Balance.error,
        isLoading: erc20Balance.isLoading,
      }
}
