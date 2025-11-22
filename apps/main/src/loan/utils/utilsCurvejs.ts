import lodash from 'lodash'
import { BandBalance, Llamma, UserLoanDetails } from '@/loan/types/loan.types'
import PromisePool from '@supercharge/promise-pool'
import { BN } from '@ui/utils'

export function getIsUserCloseToLiquidation(
  userFirstBand: number,
  userLiquidationBand: number | null,
  oraclePriceBand: number | null | undefined,
) {
  if (userLiquidationBand !== null && typeof oraclePriceBand !== 'number') {
    return false
  } else if (typeof oraclePriceBand === 'number') {
    return userFirstBand <= oraclePriceBand + 2
  }
  return false
}

export function reverseBands(bands: [number, number] | number[]) {
  return [bands[1], bands[0]] as [number, number]
}

export async function getChartBandBalancesData(
  {
    bandBalances,
    bandBalancesArr,
  }: {
    bandBalancesArr: { stablecoin: string; collateral: string; band: string }[]
    bandBalances: BandBalance
  },
  liquidationBand: number | null,
  llamma: Llamma,
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

// need due to issue with chart label not showing up correctly.
export function loadingLRPrices(prices: string[]) {
  if (!prices) return
  if (prices.length === 0) return []
  let randomNum = Math.floor(Math.random() * (100 - 1 + 1) + 1)
  randomNum = randomNum * 0.000001
  return [`${+prices[0] + randomNum}`, `${+prices[1] + randomNum}`]
}

export function sortBands(bandBalances: { [key: string]: { stablecoin: string; collateral: string } }) {
  const sortedKeys = lodash.sortBy(Object.keys(bandBalances), (k) => +k)
  const bandBalancesArr = []
  for (const k of sortedKeys) {
    bandBalancesArr.push({ ...bandBalances[k], band: k })
  }
  return { bandBalancesArr, bandBalances }
}

export function parseUserLoss(userLoss: UserLoanDetails['userLoss']) {
  const smallAmount = 0.00000001
  const resp = lodash.cloneDeep(userLoss)
  resp.loss = resp.loss && BN(resp.loss).isLessThan(smallAmount) ? '0' : userLoss.loss
  resp.loss_pct = resp.loss_pct && BN(resp.loss_pct).isLessThan(smallAmount) ? '0' : userLoss.loss_pct

  return resp
}
