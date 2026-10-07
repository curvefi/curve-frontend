import type { Pool } from '@curvefi/prices-api/pools'
import { notFalsy } from '@primitives/objects.utils'
import {
  type PoolClassification,
  poolTypeClassifications,
} from '@ui/features/pool-list/cells/PoolTitleCell/classifications'
import type { PoolRow } from '@ui/features/pool-list/types'
import type { BalancerPosition } from './api/balancer.api'

const MIN_TARGET_TVL_USD = 10_000
/** Candidates fetched for type-aware ranking, of which `MAX_SUGGESTIONS` are shown. */
const MAX_CANDIDATES = 10
const MAX_SUGGESTIONS = 5

export type CurveTarget = { pool: Pool; matchedSymbols: string[]; overlap: number }

/** Balancer v3 boosted pools hold ERC4626 wrappers, so the wrapper and its underlying both count as a match. */
const getBalancerTokenAddresses = ({ poolTokens }: BalancerPosition) =>
  poolTokens.map(({ address, symbol, underlyingToken }) => ({
    symbol: underlyingToken?.symbol ?? symbol,
    addresses: notFalsy(address, underlyingToken?.address).map(a => a.toLowerCase()),
  }))

/**
 * Candidate Curve pools, ranked by the share of the Balancer pool's tokens they hold, then by TVL.
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
    .slice(0, MAX_CANDIDATES)
}

/** Prices API reports `lpTokenSupply` in LP token units, so this is the USD value of one LP token. */
export const getCurveLpPriceUsd = ({ tvlUsd, lpTokenSupply }: Pool) =>
  lpTokenSupply > 0 ? tvlUsd / lpTokenSupply : null

/** GYROE (E-CLP) pools serve both pegged and volatile pairs, so they express no preference. */
const BALANCER_CLASSIFICATIONS: Record<string, PoolClassification> = {
  STABLE: 'stable',
  COMPOSABLE_STABLE: 'stable',
  META_STABLE: 'stable',
  WEIGHTED: 'volatile',
  QUANT_AMM_WEIGHTED: 'volatile',
  RECLAMM: 'volatile',
  COW_AMM: 'volatile',
  GYRO: 'volatile',
  GYRO3: 'volatile',
  LIQUIDITY_BOOTSTRAPPING: 'volatile',
  FIXED_LBP: 'volatile',
  FX: 'fxswap',
}

const getClassificationScore = (balancerType: string, { poolType }: PoolRow) => {
  const wanted = BALANCER_CLASSIFICATIONS[balancerType]
  const actual = poolType && poolTypeClassifications[poolType]
  return !wanted || !actual ? 0 : wanted === actual ? 1 : -1
}

/**
 * Prefers the Curve pool closest to the Balancer one: the same tokens first,
 * then the same curve (stable, volatile or FX), then TVL. The first result is the recommendation.
 */
export const rankCurveTargets = <T extends { target: CurveTarget; row: PoolRow }>(
  { type }: BalancerPosition,
  candidates: T[],
) =>
  candidates
    .toSorted(
      (a, b) =>
        b.target.overlap - a.target.overlap ||
        getClassificationScore(type, b.row) - getClassificationScore(type, a.row) ||
        b.target.pool.tvlUsd - a.target.pool.tvlUsd,
    )
    .slice(0, MAX_SUGGESTIONS)
