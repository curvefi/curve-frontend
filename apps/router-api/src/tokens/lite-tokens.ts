import { getAddress, zeroAddress } from 'viem'
import { listLitePools, type LitePool, type LitePoolCoin } from '@curvefi/prices-api/pools'
import type { Address } from '@primitives/address.utils'
import { fromEntries, maybe, maybes, notFalsy, notFalsyArray } from '@primitives/objects.utils'
import { LP_TOKEN_DECIMALS, MIN_POOL_TVL_USD } from './tokens.constants'
import { getUnderlyingCoins } from './underlying-coins'

const isBasePool = (address: Address) => (base: LitePool) =>
  (base.lpTokenAddress ?? base.address).toLowerCase() === address.toLowerCase()

export const getLiteTokens = async (chainId: number, blacklist: ReadonlySet<string>) => {
  const { pools } = await listLitePools({ chainId })
  const eligiblePools = pools.filter(
    pool => !pool.isBroken && pool.tvl > MIN_POOL_TVL_USD && !blacklist.has(pool.address.toLowerCase()),
  )

  const findPoolCoins = (pool: LitePool): LitePoolCoin[] | undefined =>
    maybe(pool.coins, coins =>
      coins.flatMap(coin =>
        notFalsyArray([coin], coin.isBasePoolLpToken && maybe(pools.find(isBasePool(coin.address)), findPoolCoins)),
      ),
    )

  const poolTokens = eligiblePools
    .flatMap(findPoolCoins)
    .map(coin =>
      maybes(
        [coin?.address, coin?.symbol, coin?.decimals],
        (address, symbol, decimals) => [getAddress(address), { symbol, decimals: +decimals }] as const,
      ),
    )
  const underlyingTokens = eligiblePools
    .flatMap(pool => getUnderlyingCoins(chainId, pool.address))
    .map(coin => maybe(coin, ({ address, symbol, decimals }) => [address, { symbol, decimals }] as const))
  const lpTokens = eligiblePools.map(pool => {
    const address = getAddress(pool.lpTokenAddress ?? pool.address)
    return (
      address !== zeroAddress &&
      maybe(pool.symbol, symbol => [address, { symbol, decimals: LP_TOKEN_DECIMALS, lp: true }] as const)
    )
  })
  return fromEntries(notFalsy(...underlyingTokens, ...poolTokens, ...lpTokens))
}
