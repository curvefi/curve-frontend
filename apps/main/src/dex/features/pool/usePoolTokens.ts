import { useMemo } from 'react'
import type { Address } from 'viem'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { useTokenBalances } from '@evm-ui/hooks/useTokenBalance'
import { mapQuery, q } from '@ui/features/queries/util'

export const usePoolTokens = ({
  chainId,
  blockchainId,
  pool,
  userAddress,
  isWrapped,
}: {
  chainId: number
  blockchainId: string
  pool: PoolTemplate
  userAddress: Address | undefined
  isWrapped: boolean
}) => {
  const { symbols, addresses, decimals } = useMemo(
    () =>
      isWrapped
        ? { symbols: pool.wrappedCoins, addresses: pool.wrappedCoinAddresses, decimals: pool.wrappedDecimals }
        : { symbols: pool.underlyingCoins, addresses: pool.underlyingCoinAddresses, decimals: pool.underlyingDecimals },
    [isWrapped, pool],
  )
  const tokenAddresses = addresses as Address[]
  const balances = useTokenBalances({ chainId, userAddress, tokenAddresses })

  return {
    tokenAddresses,
    tokenCount: tokenAddresses.length,
    decimals,
    balances,
    maxAmounts: mapQuery(balances, balances => tokenAddresses.map(address => balances[address])),
    tokens: mapQuery(balances, balances =>
      tokenAddresses.map((address, index) => ({
        address,
        blockchainId,
        symbol: symbols[index],
        balance: q({ data: balances[address], error: null, isLoading: false }),
      })),
    ),
  }
}
