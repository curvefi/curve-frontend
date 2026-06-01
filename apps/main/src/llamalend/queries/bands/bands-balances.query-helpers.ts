import { BigNumber } from 'bignumber.js'
import lodash from 'lodash'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { getPricesImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { Decimal } from '@primitives/decimal.utils'
import PromisePool from '@supercharge/promise-pool'
import { decimal } from '@ui-kit/utils/decimal'

interface BandsBalances {
  [band: number]: { borrowed: string; collateral: string }
}
type BandsBalancesArr = { borrowed: string; collateral: string; band: number }[]
interface FetchedBandsBalances {
  borrowed: Decimal
  collateral: Decimal
  collateralUsd: number
  collateralBorrowedUsd: number
  isLiquidationBand: boolean
  n: number
  p_up: number
  p_down: number
  pUpDownMedian: number
}

export const sortBands = (bandsBalances: BandsBalances) => ({
  bandsBalancesArr: lodash.sortBy(Object.keys(bandsBalances), k => +k).map(k => ({ ...bandsBalances[+k], band: +k })),
  bandsBalances,
})

export async function fetchChartBandBalancesData(
  { bandsBalancesArr }: { bandsBalances: BandsBalances; bandsBalancesArr: BandsBalancesArr },
  liquidationBand: number | null,
  market: LlamaMarketTemplate,
  isMarket: boolean,
) {
  const bands = isMarket ? bandsBalancesArr.filter(b => +b.borrowed > 0 || +b.collateral > 0) : bandsBalancesArr

  const { results }: { results: FetchedBandsBalances[] } = await PromisePool.for(bands).process(async b => {
    const { collateral, borrowed, band: n } = b
    const [p_up, p_down] = await getPricesImplementation(market).calcBandPrices(n)
    const sqrt = new BigNumber(p_up).multipliedBy(p_down).squareRoot()
    const pUpDownMedian = new BigNumber(p_up).plus(p_down).dividedBy(2).toFixed()
    const collateralUsd = new BigNumber(collateral).multipliedBy(sqrt)

    return {
      borrowed: decimal(borrowed)!,
      collateral: decimal(collateral)!,
      collateralUsd: collateralUsd.toNumber(),
      collateralBorrowedUsd: collateralUsd.plus(borrowed).toNumber(),
      isLiquidationBand: liquidationBand === +n,
      n,
      p_up: +p_up,
      p_down: +p_down,
      pUpDownMedian: +pUpDownMedian,
    }
  })

  return results
}
