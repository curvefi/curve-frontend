import { getAddress, zeroAddress } from 'viem'
import { getPools } from '@curvefi/prices-api/pools'
import { sumBy } from '@primitives/array.utils'
import { fromEntries, maybe, notFalsy, recordEntries } from '@primitives/objects.utils'
import { LP_TOKEN_DECIMALS, MIN_POOL_TVL_USD } from './tokens.constants'

export const getPricesTokens = async (chain: string, blacklist: ReadonlySet<string>) => {
  const { pools } = await getPools(chain)
  const eligiblePools = pools.filter(
    pool => pool.tvlUsd > MIN_POOL_TVL_USD && !blacklist.has(pool.address.toLowerCase()),
  )
  const poolVolumes = eligiblePools.flatMap(({ coins, tradingVolume24h: volume }) =>
    volume ? [...new Set(coins.map(coin => getAddress(coin.address)))].map(address => ({ address, volume })) : [],
  )
  const volumes = fromEntries(
    recordEntries(Object.groupBy(poolVolumes, coin => coin.address)).map(([address, coins]) => [
      address,
      sumBy(coins, coin => coin.volume),
    ]),
  )
  const poolTokens = eligiblePools
    .flatMap(pool => pool.coins)
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
  return fromEntries(notFalsy(...poolTokens, ...lpTokens))
}
