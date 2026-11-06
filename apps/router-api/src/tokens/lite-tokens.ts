import { getAddress, zeroAddress } from 'viem'
import { listLitePools, type LitePool, type LitePoolCoin } from '@curvefi/prices-api/pools'
import { fromEntries, maybe, maybes, notFalsy } from '@primitives/objects.utils'
import { LP_TOKEN_DECIMALS, MIN_POOL_TVL } from './tokens.constants'

export const getLiteTokens = async (chainId: number, blacklist: ReadonlySet<string>) => {
  const { pools } = await listLitePools({ chainId })
  const eligiblePools = pools.filter(
    pool => !pool.isBroken && pool.tvl > MIN_POOL_TVL && !blacklist.has(pool.address.toLowerCase()),
  )
  const poolCoins = (pool: LitePool): LitePoolCoin[] =>
    (pool.coins ?? []).flatMap(coin => {
      const basePool = coin.isBasePoolLpToken
        ? pools.find(base => (base.lpTokenAddress ?? base.address).toLowerCase() === coin.address.toLowerCase())
        : undefined
      return [coin, ...(maybe(basePool, poolCoins) ?? [])]
    })
  const poolTokens = eligiblePools
    .flatMap(poolCoins)
    .map(({ address, symbol, decimals }) =>
      maybes(
        [symbol, decimals],
        (symbol, decimals) => [getAddress(address), { symbol, decimals: Number(decimals) }] as const,
      ),
    )
  const lpTokens = eligiblePools.map(pool => {
    const address = getAddress(pool.lpTokenAddress ?? pool.address)
    return (
      address !== zeroAddress &&
      maybe(pool.symbol, symbol => [address, { symbol, decimals: LP_TOKEN_DECIMALS, lp: true }] as const)
    )
  })
  return fromEntries(notFalsy(...poolTokens, ...lpTokens))
}
