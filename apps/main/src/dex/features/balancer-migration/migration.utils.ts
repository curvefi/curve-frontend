import type { Pool } from '@curvefi/prices-api/pools'
import { notFalsy } from '@primitives/objects.utils'
import {
  type PoolClassification,
  poolTypeClassifications,
} from '@ui/features/pool-list/cells/PoolTitleCell/classifications'
import type { PoolRow } from '@ui/features/pool-list/types'
import { CURVE_ASSETS_URL, CURVE_LOGO_URL } from '@ui/lib/resource.constants'
import type { BalancerPosition } from './api/balancer.api'

const MIN_TARGET_TVL_USD = 1_000
/** Candidates fetched for type-aware ranking, of which `MAX_SUGGESTIONS` are shown. */
const MAX_CANDIDATES = 10
const MAX_SUGGESTIONS = 5

/** `overlap` is the share of tokens the Balancer and Curve pools have in common. */
export type CurveCandidate = { pool: Pool; overlap: number }
/** A candidate with its pool-list row, which carries the pool type, gauge and APRs. */
export type CurveTarget = CurveCandidate & { row: PoolRow }

/** Balancer v3 boosted pools hold ERC4626 wrappers, so the wrapper and its underlying both count as a match. */
const getBalancerTokenAddresses = ({ poolTokens }: BalancerPosition) =>
  poolTokens.map(({ address, underlyingToken }) =>
    notFalsy(address, underlyingToken?.address).map(a => a.toLowerCase()),
  )

/**
 * Candidate Curve pools, ranked by the share of the Balancer pool's tokens they hold, then by TVL.
 * Native ETH (0xeeee…) in Curve pools does not match WETH in Balancer pools.
 */
export function findCurveCandidates(position: BalancerPosition, curvePools: readonly Pool[]): CurveCandidate[] {
  const tokens = getBalancerTokenAddresses(position)
  return curvePools
    .filter(pool => pool.tvlUsd >= MIN_TARGET_TVL_USD)
    .map(pool => {
      const coins = new Set(pool.coins.map(coin => coin.address.toLowerCase()))
      const matched = tokens.filter(addresses => addresses.some(a => coins.has(a))).length
      return { pool, overlap: matched / Math.max(tokens.length, pool.coins.length) }
    })
    .filter(({ overlap }) => overlap > 0)
    .toSorted((a, b) => b.overlap - a.overlap || b.pool.tvlUsd - a.pool.tvlUsd)
    .slice(0, MAX_CANDIDATES)
}

/** Prices API reports `lpTokenSupply` in LP token units, so this is the USD value of one LP token. */
export const getCurveLpPriceUsd = ({ tvlUsd, lpTokenSupply }: Pool) =>
  lpTokenSupply > 0 ? tvlUsd / lpTokenSupply : null

/** GYROE (E-CLP) pools serve both pegged and volatile pairs, so they express no curve preference. */
const BALANCER_POOL_TYPES: Record<string, { label: string; classification?: PoolClassification }> = {
  STABLE: { label: 'Stable', classification: 'stable' },
  COMPOSABLE_STABLE: { label: 'Composable stable', classification: 'stable' },
  META_STABLE: { label: 'Meta stable', classification: 'stable' },
  WEIGHTED: { label: 'Weighted', classification: 'volatile' },
  QUANT_AMM_WEIGHTED: { label: 'QuantAMM', classification: 'volatile' },
  RECLAMM: { label: 'reCLAMM', classification: 'volatile' },
  COW_AMM: { label: 'CoW AMM', classification: 'volatile' },
  GYRO: { label: '2-CLP', classification: 'volatile' },
  GYRO3: { label: '3-CLP', classification: 'volatile' },
  GYROE: { label: 'E-CLP' },
  LIQUIDITY_BOOTSTRAPPING: { label: 'LBP', classification: 'volatile' },
  FIXED_LBP: { label: 'Fixed LBP', classification: 'volatile' },
  FX: { label: 'FX', classification: 'fxswap' },
}

export const getBalancerTypeLabel = (type: string) => BALANCER_POOL_TYPES[type]?.label ?? type

const getClassificationScore = (balancerType: string, { poolType }: PoolRow) => {
  const wanted = BALANCER_POOL_TYPES[balancerType]?.classification
  const actual = poolType && poolTypeClassifications[poolType]
  return !wanted || !actual ? 0 : wanted === actual ? 1 : -1
}

/**
 * Prefers the Curve pool closest to the Balancer one: the same tokens first,
 * then the same curve (stable, volatile or FX), then TVL. The first result is the recommendation.
 */
export const rankCurveTargets = ({ type }: BalancerPosition, targets: CurveTarget[]) =>
  targets
    .toSorted(
      (a, b) =>
        b.overlap - a.overlap ||
        getClassificationScore(type, b.row) - getClassificationScore(type, a.row) ||
        b.pool.tvlUsd - a.pool.tvlUsd,
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

export const PROTOCOLS = {
  balancer: { name: 'Balancer', logoUrl: `${CURVE_ASSETS_URL}/platforms/balancer.png` },
  curve: { name: 'Curve', logoUrl: CURVE_LOGO_URL },
} as const satisfies Record<MigrationProtocol, { name: string; logoUrl: string }>
