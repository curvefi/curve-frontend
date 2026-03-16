import { type Address, erc20Abi } from 'viem'
import { queryClient } from '@ui-kit/lib/api'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'
import { readContractsQueryOptions } from '@wagmi/core/query'
import { mockedWagmiConfig } from './test-wagmi.helpers'

export const seedErc20BalanceQuery = ({
  chainId,
  tokenAddress,
  userAddress,
  rawBalance,
  decimals = 18,
}: {
  chainId: number
  tokenAddress: Address
  userAddress: Address
  rawBalance: bigint
  decimals?: number
}) => {
  const { queryKey } = readContractsQueryOptions(mockedWagmiConfig, {
    contracts: [
      { chainId, address: tokenAddress, abi: erc20Abi, functionName: 'balanceOf', args: [userAddress] },
      { chainId, address: tokenAddress, abi: erc20Abi, functionName: 'decimals' },
    ] as const,
  })
  queryClient.setQueryData(queryKey, [
    { status: 'success', result: rawBalance },
    { status: 'success', result: decimals },
  ])
}

export const seedErc20BalanceForAddresses = ({
  chainId,
  tokenAddress,
  addresses,
  rawBalance,
  decimals = 18,
}: {
  chainId: number
  tokenAddress: Address
  addresses: Address[]
  rawBalance: bigint
  decimals?: number
}) =>
  addresses.forEach((userAddress) =>
    seedErc20BalanceQuery({
      chainId,
      tokenAddress,
      userAddress,
      rawBalance,
      decimals,
    }),
  )

export const seedCrvUsdBalance = ({
  chainId,
  addresses,
  rawBalance,
  decimals = 18,
}: {
  chainId: number
  addresses: Address[]
  rawBalance: bigint
  decimals?: number
}) =>
  seedErc20BalanceForAddresses({
    chainId,
    tokenAddress: CRVUSD_ADDRESS as Address,
    addresses,
    rawBalance,
    decimals,
  })
