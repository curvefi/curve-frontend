import lodash from 'lodash'
import type { FetchedBandsBalances, ParsedBandsBalances } from '@/llamalend/features/bands-chart/types'

const ORACLE_CONTEXT_OFFSETS = [-1, 0, 1] as const

export const parseFetchedBandsBalances = (
  bandsBalances: FetchedBandsBalances[] | undefined,
  collateralUsdRate: number | undefined,
  borrowedUsdRate: number | undefined,
): ParsedBandsBalances[] =>
  bandsBalances?.map((band) => {
    const collateralValueUsd = collateralUsdRate != null ? +band.collateral * collateralUsdRate : band.collateralUsd
    const borrowedValueUsd = borrowedUsdRate != null ? +band.borrowed * borrowedUsdRate : +band.borrowed

    return {
      ...band,
      collateralValueUsd,
      borrowedValueUsd,
      totalBandValueUsd: collateralValueUsd + borrowedValueUsd,
      isOraclePriceBand: false, // updated in chart processing with oraclePriceBand
    }
  }) ?? []

export const getMissingOracleContextBandNumbers = (
  marketBandsBalances: FetchedBandsBalances[] | undefined,
  oraclePriceBand: number | null | undefined,
): number[] => {
  if (!marketBandsBalances) return []
  if (oraclePriceBand == null || !Number.isFinite(oraclePriceBand)) return []

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
