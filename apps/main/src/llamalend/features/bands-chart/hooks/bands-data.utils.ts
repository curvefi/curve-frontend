import lodash from 'lodash'
import type { FetchedBandsBalances } from '@/llamalend/features/bands-chart/types'

// Bands to fetch around the oracle price band (N-1, N, N+1) — see useMarketOracleContextBands for why these are needed
const ORACLE_CONTEXT_OFFSETS = [-1, 0, 1] as const

export const getMissingOracleContextBandNumbers = (
  marketBandsBalances: FetchedBandsBalances[] | undefined,
  oraclePriceBand: number | null | undefined,
): number[] => {
  if (!marketBandsBalances || oraclePriceBand == null || !Number.isFinite(oraclePriceBand)) return []

  const existingBandNumbers = new Set(marketBandsBalances.map((band) => band.n))

  return lodash.sortBy(
    ORACLE_CONTEXT_OFFSETS.map((offset) => oraclePriceBand + offset).filter((band) => !existingBandNumbers.has(band)),
  )
}

export const mergeMarketBandsWithOracleContext = (
  marketBandsBalances: FetchedBandsBalances[] | undefined,
  oracleContextBands: FetchedBandsBalances[] | undefined,
): FetchedBandsBalances[] | undefined => {
  if (!marketBandsBalances?.length) return oracleContextBands?.length ? [...oracleContextBands] : marketBandsBalances
  if (!oracleContextBands?.length) return marketBandsBalances

  const existingBandNumbers = new Set(marketBandsBalances.map((band) => band.n))
  return [...marketBandsBalances, ...oracleContextBands.filter((band) => !existingBandNumbers.has(band.n))]
}
