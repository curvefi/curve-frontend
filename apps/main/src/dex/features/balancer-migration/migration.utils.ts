import type { Pool } from '@curvefi/prices-api/pools'
import { notFalsy } from '@primitives/objects.utils'
import type { BalancerPosition } from './api/balancer.api'

const MIN_TARGET_TVL_USD = 10_000
const MAX_SUGGESTIONS = 5

export type CurveTarget = { pool: Pool; matchedSymbols: string[]; overlap: number }

/** Balancer v3 boosted pools hold ERC4626 wrappers, so the wrapper and its underlying both count as a match. */
const getBalancerTokenAddresses = ({ poolTokens }: BalancerPosition) =>
  poolTokens.map(({ address, symbol, underlyingToken }) => ({
    symbol: underlyingToken?.symbol ?? symbol,
    addresses: notFalsy(address, underlyingToken?.address).map(a => a.toLowerCase()),
  }))

/**
 * Ranks Curve pools by the share of the Balancer pool's tokens they hold, then by TVL.
 * Native ETH (0xeeee…) in Curve pools does not match WETH in Balancer pools.
 */
export function findCurveTargets(position: BalancerPosition, curvePools: readonly Pool[]): CurveTarget[] {
  const tokens = getBalancerTokenAddresses(position)
  return curvePools
    .filter(pool => pool.tvlUsd >= MIN_TARGET_TVL_USD)
    .map(pool => {
      const coins = new Set(pool.coins.map(coin => coin.address.toLowerCase()))
      const matchedSymbols = tokens.filter(t => t.addresses.some(a => coins.has(a))).map(t => t.symbol)
      return { pool, matchedSymbols, overlap: matchedSymbols.length / Math.max(tokens.length, pool.coins.length) }
    })
    .filter(({ overlap }) => overlap > 0)
    .toSorted((a, b) => b.overlap - a.overlap || b.pool.tvlUsd - a.pool.tvlUsd)
    .slice(0, MAX_SUGGESTIONS)
}

/** Prices API reports `lpTokenSupply` in LP token units, so this is the USD value of one LP token. */
export const getCurveLpPriceUsd = ({ tvlUsd, lpTokenSupply }: Pool) =>
  lpTokenSupply > 0 ? tvlUsd / lpTokenSupply : null
