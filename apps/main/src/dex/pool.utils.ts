import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { shortenAddress } from '@evm-ui/utils'

const WRAPPED_ONLY_POOL_IDS = ['pax', 'busd', 'y']

export const isWrappedOnly = (pool: PoolTemplate) => WRAPPED_ONLY_POOL_IDS.includes(pool.id)
export const hasWrapped = (pool: PoolTemplate) => isWrappedOnly(pool) || !(pool?.isPlain || pool?.isFake)

export const getTokens = (pool: PoolTemplate, { wrapped }: { wrapped: boolean }) => ({
  tokens: wrapped
    ? pool.wrappedCoins.map((token, idx) => token || shortenAddress(pool.wrappedCoinAddresses[idx]))
    : pool.underlyingCoins.map((token, idx) => token || shortenAddress(pool.underlyingCoinAddresses[idx])),
  tokenAddresses: wrapped ? pool.wrappedCoinAddresses : pool.underlyingCoinAddresses,
  tokenAddressesAll: wrapped
    ? pool.wrappedCoinAddresses
    : [...pool.underlyingCoinAddresses, ...pool.wrappedCoinAddresses],
})
