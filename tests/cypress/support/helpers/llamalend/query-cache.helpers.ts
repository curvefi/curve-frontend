import { type Address } from 'viem'
import { queryClient } from '@ui-kit/lib/api'

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
}) =>
  [
    [
      'readContracts',
      {
        contracts: [
          { chainId, address: tokenAddress, functionName: 'balanceOf', args: [userAddress] },
          { chainId, address: tokenAddress, functionName: 'decimals' },
        ],
      },
    ],
    [
      'readContracts',
      {
        allowFailure: true,
        contracts: [
          { chainId, address: tokenAddress, functionName: 'balanceOf', args: [userAddress] },
          { chainId, address: tokenAddress, functionName: 'decimals' },
        ],
      },
    ],
    [
      'readContracts',
      {
        allowFailure: false,
        contracts: [
          { chainId, address: tokenAddress, functionName: 'balanceOf', args: [userAddress] },
          { chainId, address: tokenAddress, functionName: 'decimals' },
        ],
      },
    ],
  ].forEach((key) =>
    queryClient.setQueryData(key, [
      { status: 'success', result: rawBalance },
      { status: 'success', result: decimals },
    ]),
  )

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
