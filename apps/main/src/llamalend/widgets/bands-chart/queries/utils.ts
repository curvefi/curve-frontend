import lodash from 'lodash'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import PromisePool from '@supercharge/promise-pool'
import { BN } from '@ui/utils'
import type { BandsBalances, BandsBalancesArr, ParsedBandsBalances } from '../types'

// TODO: refactor to reduce code duplication

// lend variant
export async function fetchLendChartBandBalancesData(
  { bandsBalances, bandsBalancesArr }: { bandsBalances: BandsBalances; bandsBalancesArr: BandsBalancesArr },
  liquidationBand: number | null,
  market: LendMarketTemplate,
  isMarket: boolean,
) {
  // filter out bands that doesn't have borrowed or collaterals
  const ns = isMarket
    ? bandsBalancesArr
        .filter((b) => {
          const { borrowed, collateral } = bandsBalances[b.band] ?? {}
          return +borrowed > 0 || +collateral > 0
        })
        .map((b) => b.band)
    : bandsBalancesArr.map((b) => b.band)

  // TODO: handle errors
  const { results } = await PromisePool.for(ns).process(async (n) => {
    const { collateral, borrowed } = bandsBalances[n]
    const [p_up, p_down] = await market.calcBandPrices(+n)
    const sqrt = new BN(p_up).multipliedBy(p_down).squareRoot()
    const pUpDownMedian = new BN(p_up).plus(p_down).dividedBy(2).toString()
    const collateralUsd = new BN(collateral).multipliedBy(sqrt)

    return {
      borrowed,
      collateral,
      collateralUsd: collateralUsd.toString(),
      collateralBorrowedUsd: collateralUsd.plus(borrowed).toNumber(),
      isLiquidationBand: liquidationBand ? (liquidationBand === +n ? 'SL' : '') : '',
      isOraclePriceBand: false, // update this with detail info oracle price
      isNGrouped: false,
      n: n.toString(),
      p_up,
      p_down,
      pUpDownMedian,
    } as ParsedBandsBalances
  })

  const parsedBandBalances = []
  for (const idx in results) {
    const r = results[idx]
    parsedBandBalances.unshift(r)
  }
  return parsedBandBalances
}

export function sortLendBands(bandsBalances: { [index: number]: { borrowed: string; collateral: string } }) {
  const sortedKeys = lodash.sortBy(Object.keys(bandsBalances), (k) => +k)
  const bandsBalancesArr: { borrowed: string; collateral: string; band: number }[] = []
  for (const k of sortedKeys) {
    // @ts-ignore
    bandsBalancesArr.push({ ...bandsBalances[k], band: k })
  }
  return { bandsBalancesArr, bandsBalances }
}

// loan variant
export async function fetchMintChartBandBalancesData(
  {
    bandBalances,
    bandBalancesArr,
  }: {
    bandBalancesArr: { stablecoin: string; collateral: string; band: string }[]
    bandBalances: Record<string, { stablecoin: string; collateral: string }>
  },
  liquidationBand: number | null,
  llamma: MintMarketTemplate,
) {
  // filter out bands that doesn't have stablecoin and collaterals
  const ns = bandBalancesArr
    .filter((b) => {
      const { stablecoin, collateral } = bandBalances[b.band] ?? {}
      return +stablecoin > 0 || +collateral > 0
    })
    .map((b) => b.band)

  // TODO: handle errors
  const { results } = await PromisePool.for(ns).process(async (n) => {
    const { collateral, stablecoin } = bandBalances[n]
    const [p_up, p_down] = await llamma.calcBandPrices(+n)
    const sqrt = new BN(p_up).multipliedBy(p_down).squareRoot()
    const pUpDownMedian = new BN(p_up).plus(p_down).dividedBy(2).toFixed(5)
    const collateralUsd = new BN(collateral).multipliedBy(sqrt)

    return {
      collateral,
      collateralUsd: collateralUsd.toString(),
      isLiquidationBand: liquidationBand ? (liquidationBand === +n ? 'SL' : '') : '',
      isOraclePriceBand: false, // update this with detail info oracle price
      isNGrouped: false,
      n,
      p_up,
      p_down,
      pUpDownMedian,
      stablecoin,
      collateralStablecoinUsd: collateralUsd.plus(stablecoin).toNumber(),
    }
  })

  const parsedBandBalances = []
  for (const idx in results) {
    const r = results[idx]
    parsedBandBalances.unshift(r)
  }
  return parsedBandBalances
}

export function sortMintBands(bandBalances: { [key: string]: { stablecoin: string; collateral: string } }) {
  const sortedKeys = lodash.sortBy(Object.keys(bandBalances), (k) => +k)
  const bandBalancesArr = []
  for (const k of sortedKeys) {
    bandBalancesArr.push({ ...bandBalances[k], band: k })
  }
  return { bandBalancesArr, bandBalances }
}
