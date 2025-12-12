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
type TokenBalanceQuery = ChainQuery & UserQuery & TokenQuery

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
const getERC20QueryContracts = ({ chainId, userAddress, tokenAddress }: TokenBalanceQuery) =>
  [
    { chainId, address: tokenAddress, abi: erc20Abi, functionName: 'balanceOf', args: [userAddress] },
    { chainId, address: tokenAddress, abi: erc20Abi, functionName: 'decimals' },
  ] as const

/** In the Curve ecosystem all native chain gas tokens are the 0xeee...eee address */
const isNative = ({ tokenAddress }: TokenQuery) => isAddressEqual(tokenAddress, ethAddress)

/** Imperatively fetch token balance. Uses a staletime of 0 to always be guaranteed of a fresh result. */
export const fetchTokenBalance = async (config: Config, query: TokenBalanceQuery) =>
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
export function useTokenBalance(
  { chainId, userAddress, tokenAddress }: FieldsOf<TokenBalanceQuery>,
  enabled: boolean = true,
) {
  const config = useConfig()

  const isEnabled = enabled && chainId != null && userAddress != null && tokenAddress != null
  const isNativeToken = tokenAddress != null && isNative({ tokenAddress })

  const nativeBalance = useBalance({
    ...(isEnabled ? getNativeBalanceQueryOptions(config, { chainId, userAddress }) : {}),
    query: { enabled: isEnabled && isNativeToken },
  })

  // Spreading with ...readContractsQueryOptions() breaks Typescript's type inference, so we have to settle with the
  // least common denominator that does *not* cause type  inference issues, which is getERC20QueryContracts.
  const erc20Balance = useReadContracts({
    allowFailure: false,
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
          erc20Balance.data &&
          convertBalance({
            value: erc20Balance.data[0],
            decimals: erc20Balance.data[1],
          }),
        error: erc20Balance.error,
        isLoading: erc20Balance.isLoading,
      }
}
