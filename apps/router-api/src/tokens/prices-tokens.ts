import { getAddress, zeroAddress, type Address } from 'viem'
import { getPools, type Pool, type V2PoolChain } from '@curvefi/prices-api/pools'
import { sumBy } from '@primitives/array.utils'
import { Chain } from '@primitives/network.utils'
import { fromEntries, maybe, notFalsy, notFalsyArray, recordEntries } from '@primitives/objects.utils'
import { getPoolNativeCoin } from './native-tokens'
import { LP_TOKEN_DECIMALS, MIN_POOL_TVL_USD } from './tokens.constants'
import { getUnderlyingCoins } from './underlying-coins'

/** Small workaround for custom tokens. Primarily tokens that are used in lending markets and are supported by the router, but have no proper Curve pool. There's a ticket to add tokens from llamalend to the token selector. */
const CUSTOM_TOKENS: Record<number, readonly [Address, { symbol: string; decimals: number; volume: number }][]> = {
  [Chain.Ethereum]: [
    ['0xE5F130253fF137f9917C0107659A4c5262abf6b0', { symbol: 'svZCHF', decimals: 18, volume: 0 }],
    ['0xD2af830E8CBdFed6CC11Bab697bB25496ed6FA62', { symbol: 'WOUSD', decimals: 18, volume: 0 }],
  ],
}

export const getPricesTokens = async ({ chainId, name }: V2PoolChain, blacklist: ReadonlySet<string>) => {
  const { pools } = await getPools(name)
  const eligiblePools = pools.filter(
    pool => pool.tvlUsd > MIN_POOL_TVL_USD && !blacklist.has(pool.address.toLowerCase()),
  )
  const getPoolCoins = (pool: Pool) => [
    ...notFalsyArray(getUnderlyingCoins(chainId, pool.address)),
    ...pool.coins,
    ...notFalsy(getPoolNativeCoin(chainId, pool)),
  ]
  const poolVolumes = eligiblePools.flatMap(pool =>
    pool.tradingVolume24h
      ? [...new Set(getPoolCoins(pool).map(coin => getAddress(coin.address)))].map(address => ({
          address,
          volume: pool.tradingVolume24h,
        }))
      : [],
  )
  const volumes = fromEntries(
    recordEntries(Object.groupBy(poolVolumes, coin => coin.address)).map(([address, coins]) => [
      address,
      sumBy(coins, coin => coin.volume),
    ]),
  )
  const poolTokens = eligiblePools
    .flatMap(getPoolCoins)
    .map(({ address, symbol, decimals }) =>
      maybe(
        decimals,
        decimals => [getAddress(address), { symbol, decimals, volume: volumes[getAddress(address)] }] as const,
      ),
    )
  const lpTokens = eligiblePools.map(({ lpTokenAddress, lpTokenSymbol }) => {
    const address = getAddress(lpTokenAddress)
    return (
      address !== zeroAddress &&
      ([address, { symbol: lpTokenSymbol, decimals: LP_TOKEN_DECIMALS, lp: true, volume: volumes[address] }] as const)
    )
  })
  return fromEntries(notFalsy(...poolTokens, ...lpTokens, ...(CUSTOM_TOKENS[chainId] ?? [])))
}
