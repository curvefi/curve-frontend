import lodash from 'lodash'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import PromisePool from '@supercharge/promise-pool'
import { BN } from '@ui/utils'
import type { BandsBalances, BandsBalancesArr, ParsedBandsBalances } from '../types'

export async function fetchChartBandBalancesData(
  { bandsBalances, bandsBalancesArr }: { bandsBalances: BandsBalances; bandsBalancesArr: BandsBalancesArr },
  liquidationBand: number | null,
  market: LendMarketTemplate | MintMarketTemplate,
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
      n: n.toString(),
      p_up,
      p_down,
      pUpDownMedian,
    } as ParsedBandsBalances
  })

  return results.reverse()
}

export const sortBands = (bandsBalances: BandsBalances) => ({
  bandsBalancesArr: lodash
    .sortBy(Object.keys(bandsBalances), (k) => +k)
    .map((k) => ({ ...bandsBalances[Number(k)], band: Number(k) })),
  bandsBalances,
})
