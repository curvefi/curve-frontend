import type { MarketTemplate } from '@/llamalend/llamalend.types'
import { getPricesImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { sortBy } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { recordEntries } from '@primitives/objects.utils'
import { PromisePool } from '@supercharge/promise-pool'
import { decimal, decimalDiv, decimalGreaterThan, decimalMultiply, decimalSqrt, decimalSum } from '@ui/lib/decimal'

type BandsBalances = Record<number, { borrowed: string; collateral: string }>
type SortedBandBalance = { borrowed: Decimal; collateral: Decimal; band: number }

export const sortBands = (bandsBalances: BandsBalances): SortedBandBalance[] =>
  sortBy(
    recordEntries(bandsBalances).map(([band, { borrowed, collateral }]) => ({
      borrowed: decimal(borrowed)!,
      collateral: decimal(collateral)!,
      band: Number(band),
    })),
    ({ band }) => band,
  )

export async function fetchChartBandBalancesData(
  bandsBalancesArr: SortedBandBalance[],
  liquidationBand: number | null,
  market: MarketTemplate,
  isMarket: boolean,
) {
  const bands = isMarket
    ? bandsBalancesArr.filter(b => decimalGreaterThan(b.borrowed, '0') || decimalGreaterThan(b.collateral, '0'))
    : bandsBalancesArr

  const { results } = await PromisePool.for(bands).process(async b => {
    const { collateral, borrowed, band: n } = b
    const [pUp, pDown] = await getPricesImplementation(market).calcBandPrices(n)
    const p_up = decimal(pUp)!
    const p_down = decimal(pDown)!
    const sqrtPrice = decimalSqrt(decimalMultiply(p_up, p_down))
    const pUpDownMedian = decimalDiv(decimalSum(p_up, p_down), '2')
    const collateralValue = decimalMultiply(collateral, sqrtPrice)

    return {
      borrowed,
      collateral,
      collateralValue,
      totalValue: decimalSum(collateralValue, borrowed),
      isLiquidationBand: liquidationBand === n,
      n,
      p_up,
      p_down,
      pUpDownMedian,
    }
  })

  return results
}

export type FetchedBandsBalances = Awaited<ReturnType<typeof fetchChartBandBalancesData>>[number]
