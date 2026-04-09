import { type Address, erc20Abi, parseUnits } from 'viem'
import type { Decimal } from '@primitives/decimal.utils'
import { queryClient } from '@ui-kit/lib/api'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'
import { readContractsQueryOptions } from '@wagmi/core/query'
import { oneInt } from '../../generators'
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
  min,
  max = `${Number(min) * 100}`,
  decimals = 18,
}: {
  chainId: number
  addresses: Address[]
  min: Decimal
  max?: Decimal
  decimals?: number
}) =>
  seedErc20BalanceForAddresses({
    chainId,
    tokenAddress: CRVUSD_ADDRESS as Address,
    addresses,
    rawBalance: parseUnits(`${oneInt(Math.ceil(Number(min)), Math.ceil(Number(max)))}`, decimals),
    decimals,
  })
