import type { Address } from 'viem'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { useTokenBalances } from '@evm-ui/hooks/useTokenBalance'
import { zip } from '@primitives/array.utils'
import { constQ } from '@ui/features/queries/util'

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
    maxAmounts: tokenAddresses.map(address => balances[address]),
    tokens: zip(tokenAddresses, symbols).map(([address, symbol]) =>
      constQ({ address, blockchainId, symbol, balance: balances[address] }),
    ),
  }
}
