import { sumBy } from 'lodash'
import type { LendingVault } from '@/llamalend/queries/market-list/lending-vaults'
import type { MintMarket } from '@/llamalend/queries/market-list/mint-markets'
import type { UsdPriceHistory } from '@curvefi/prices-api/usd-price'
import type { YieldBasisPoolVolume } from '@curvefi/prices-api/yield-basis'
import type { MintMarketRow, YieldBasisPoolRow } from './types'

export const CHAIN = 'ethereum' as const

export const getWeightedAverage = <T>(items: T[], getValue: (item: T) => number, getWeight: (item: T) => number) => {
  const totalWeight = sumBy(items, getWeight)
  return totalWeight ? sumBy(items, item => getValue(item) * getWeight(item)) / totalWeight : 0
}

export const getLatestPrice = (prices: UsdPriceHistory | undefined) => {
  const sorted = [...(prices ?? [])].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  const latest = sorted.at(-1)
  const previous = latest
    ? [...sorted]
        .reverse()
        .find(price => new Date(price.timestamp).getTime() <= new Date(latest.timestamp).getTime() - 86400000)
    : undefined
  const changePct = latest && previous?.price ? ((latest.price - previous.price) / previous.price) * 100 : undefined

  return {
    price: latest?.price,
    changePct,
    timestamp: latest?.timestamp,
  }
}

export const toMintMarketRows = (markets: MintMarket[] | undefined): MintMarketRow[] =>
  (markets ?? [])
    .filter(market => market.chain === CHAIN)
    .map(market => ({
      url: null,
      market: market.name,
      borrowedUsd: market.borrowedUsd,
      collateralUsd: market.collateralAmountUsd,
      borrowApy: market.borrowApy,
      loans: market.loans,
      utilization: market.debtCeiling ? Math.min(100, (100 * market.borrowed) / market.debtCeiling) : 0,
    }))
    .sort((a, b) => b.borrowedUsd - a.borrowedUsd)

export const toYieldBasisPoolRows = (volumes: (YieldBasisPoolVolume | undefined)[] | undefined): YieldBasisPoolRow[] =>
  (volumes ?? [])
    .filter((volume): volume is YieldBasisPoolVolume => Boolean(volume))
    .map(volume => {
      const volume7d = sumBy(volume.transactions, transaction => transaction.volume)
      const adjacentVolume7d = sumBy(volume.transactions, transaction => transaction.adjacentVolume)
      const totalVolume7d = volume7d + adjacentVolume7d

      return {
        url: null,
        name: volume.poolName,
        address: volume.poolAddress,
        transactionCount: volume.transactions.length,
        volume7d,
        adjacentVolume7d,
        totalVolume7d,
        adjacentVolumeShare: totalVolume7d ? (100 * adjacentVolume7d) / totalVolume7d : 0,
      }
    })
    .sort((a, b) => b.totalVolume7d - a.totalVolume7d)

export const getLlamaLendSummary = (vaults: LendingVault[] | undefined) => {
  const activeVaults = vaults ?? []
  const totalSupplied = sumBy(activeVaults, vault => vault.totalAssetsUsd)
  const totalBorrowed = sumBy(activeVaults, vault => vault.totalDebtUsd)

  return {
    activeMarkets: activeVaults.length,
    totalSupplied,
    totalBorrowed,
    utilization: totalSupplied ? (100 * totalBorrowed) / totalSupplied : 0,
    avgBorrowApy: getWeightedAverage(
      activeVaults,
      vault => vault.borrowApy,
      vault => vault.totalDebtUsd,
    ),
    avgLendApy: getWeightedAverage(
      activeVaults,
      vault => vault.apyLend,
      vault => vault.totalAssetsUsd,
    ),
  }
}
