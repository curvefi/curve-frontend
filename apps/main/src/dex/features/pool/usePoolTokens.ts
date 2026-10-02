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
  const coinField = isWrapped ? ('wrapped' as const) : ('underlying' as const)
  const symbols = pool[`${coinField}Coins`]
  const tokenAddresses = pool[`${coinField}CoinAddresses`] as Address[]
  const balances = useTokenBalances({ chainId, userAddress, tokenAddresses })
  return {
    tokenAddresses,
    tokenCount: tokenAddresses.length,
    decimals: pool[`${coinField}Decimals`],
    balances,
    maxAmounts: mapQuery(balances, balances => tokenAddresses.map(address => balances[address])),
    tokens: mapQuery(balances, b =>
      tokenAddresses.map((address, index) => ({
        address,
        blockchainId,
        symbol: symbols[index],
        balance: q({ data: b[address], error: balances.error, isLoading: balances.isLoading }), // todo: proper query after PR #3310
      })),
    ),
  }
}
