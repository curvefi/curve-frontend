import lodash from 'lodash'
import { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import PromisePool from '@supercharge/promise-pool'
import { BN } from '@ui/utils'
import { decimal, type Decimal } from '@ui-kit/utils/decimal'
import type { BandsBalances, BandsBalancesArr, FetchedBandsBalances, ParsedBandsBalances } from '../types'

export async function fetchChartBandBalancesData(
  { bandsBalances, bandsBalancesArr }: { bandsBalances: BandsBalances; bandsBalancesArr: BandsBalancesArr },
  liquidationBand: number | null,
  market: LlamaMarketTemplate,
  isMarket: boolean,
) {
  // filter out bands that doesn't have borrowed or collaterals
  const ns = (
    isMarket
      ? bandsBalancesArr.filter((b) => {
          const { borrowed, collateral } = bandsBalances[b.band] ?? {}
          return +borrowed > 0 || +collateral > 0
        })
      : bandsBalancesArr
  ).map((b) => b.band)

  const { results }: { results: FetchedBandsBalances[] } = await PromisePool.for(ns).process(async (n) => {
    const { collateral, borrowed } = bandsBalances[n]
    const [p_up, p_down] = await market.calcBandPrices(+n)
    const sqrt = new BN(p_up).multipliedBy(p_down).squareRoot()
    const pUpDownMedian = new BN(p_up).plus(p_down).dividedBy(2).toString()
    const collateralUsd = new BN(collateral).multipliedBy(sqrt) // this only works when borrowed tokens value = 1 usd (might not work in LLv2)

    return {
      borrowed: decimal(borrowed) as Decimal,
      collateral: decimal(collateral) as Decimal,
      collateralUsd: collateralUsd.toNumber(),
      collateralBorrowedUsd: collateralUsd.plus(borrowed).toNumber(),
      isLiquidationBand: liquidationBand ? (liquidationBand === +n ? 'SL' : '') : '',
      isOraclePriceBand: false,
      n: n,
      p_up: Number(p_up),
      p_down: Number(p_down),
      pUpDownMedian: Number(pUpDownMedian),
    }
  })

  return results.reverse()
}

export const parseFetchedBandsBalances = (
  bandsBalances: FetchedBandsBalances[] | undefined,
  collateralUsdRate: number | null | undefined,
  borrowedUsdRate: number | null | undefined,
): ParsedBandsBalances[] =>
  bandsBalances?.map((band) => {
    const collateralValueUsd = Number(band.collateral) * (collateralUsdRate ?? 0)
    const borrowedValueUsd = Number(band.borrowed) * (borrowedUsdRate ?? 0)

    return {
      ...band,
      collateralValueUsd: collateralUsdRate && collateralUsdRate > 0 ? collateralValueUsd : band.collateralUsd,
      borrowedValueUsd: borrowedUsdRate && borrowedUsdRate > 0 ? borrowedValueUsd : band.collateralBorrowedUsd,
      totalBandValueUsd: collateralValueUsd + borrowedValueUsd,
      isOraclePriceBand: false, // update this with detail info oracle price
    }
  }) ?? []

export const sortBands = (bandsBalances: BandsBalances) => ({
  bandsBalancesArr: lodash
    .sortBy(Object.keys(bandsBalances), (k) => +k)
    .map((k) => ({ ...bandsBalances[Number(k)], band: Number(k) })),
  bandsBalances,
})
