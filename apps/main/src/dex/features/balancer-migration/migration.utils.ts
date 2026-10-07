import type { Pool } from '@curvefi/prices-api/pools'
import type { Address } from '@primitives/address.utils'
import { notFalsy } from '@primitives/objects.utils'
import {
  type PoolClassification,
  poolTypeClassifications,
} from '@ui/features/pool-list/cells/PoolTitleCell/classifications'
import type { PoolRow } from '@ui/features/pool-list/types'
import type { BalancerPosition } from './api/balancer.api'

const MIN_TARGET_TVL_USD = 1_000
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

/**
 * APR types that add up to what any LP earns, like Curve's Net APR (base, unboosted emissions and rewards).
 * Boosts, locking, voting, Aura and the 7d/30d duplicates of the 24h figures are left out.
 */
const BALANCER_NET_APR_TYPES = new Set([
  'SWAP_FEE_24H',
  'DYNAMIC_SWAP_FEE_24H',
  'SURPLUS_24H',
  'IB_YIELD',
  'NESTED',
  'STAKING',
  'VEBAL_EMISSIONS',
  'MABEETS_EMISSIONS',
  'MERKL',
  'FUUL',
  'QUANT_AMM_UPLIFT',
])

/** Net APR items in percent, matching the Curve pool-list units. */
export const getBalancerNetAprItems = ({ dynamicData: { aprItems } }: BalancerPosition) =>
  aprItems
    .filter(({ type, apr }) => BALANCER_NET_APR_TYPES.has(type) && apr > 0)
    .map(({ title, apr }) => ({ title, apr: apr * 100 }))

/** Boosted pools show the underlying tokens rather than their ERC4626 wrappers. */
export const getBalancerIconTokens = ({ poolTokens }: BalancerPosition) =>
  poolTokens.map(({ underlyingToken, address, symbol }) => underlyingToken ?? { address, symbol })

export type MigrationProtocol = 'balancer' | 'curve'

/** Mainnet BAL and CRV, whose icons are the protocol logos. */
export const PROTOCOL_LOGO_TOKENS = {
  balancer: '0xba100000625a3754423978a60c9317c58a424e3D',
  curve: '0xD533a949740bb3306d119CC777fa900bA034cd52',
} as const satisfies Record<MigrationProtocol, Address>

const BALANCER_TYPE_LABELS: Record<string, string> = {
  STABLE: 'Stable',
  COMPOSABLE_STABLE: 'Composable stable',
  META_STABLE: 'Meta stable',
  WEIGHTED: 'Weighted',
  QUANT_AMM_WEIGHTED: 'QuantAMM',
  RECLAMM: 'reCLAMM',
  COW_AMM: 'CoW AMM',
  GYRO: '2-CLP',
  GYRO3: '3-CLP',
  GYROE: 'E-CLP',
  LIQUIDITY_BOOTSTRAPPING: 'LBP',
  FIXED_LBP: 'Fixed LBP',
  FX: 'FX',
}

export const getBalancerTypeLabel = (type: string) => BALANCER_TYPE_LABELS[type] ?? type
