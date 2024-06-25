import cloneDeep from 'lodash/cloneDeep'
import sortBy from 'lodash/sortBy'
import PromisePool from '@supercharge/promise-pool'

import { BN } from '@/ui/utils'
import networks from '@/networks'

export async function initCurveJs(chainId: ChainId, wallet: Wallet | null): Promise<Curve | undefined> {
  const { networkId, rpcUrl } = networks[chainId]
  const api = cloneDeep((await import('@curvefi/stablecoin-api')).default) as Curve

  if (wallet) {
    await api.init('Web3', { network: networkId, externalProvider: getWalletProvider(wallet) }, { chainId })
    return api
  } else if (rpcUrl) {
    await api.init('JsonRpc', { url: rpcUrl }, { chainId })
    return api
  }
}

export function getImageBaseUrl(rChainId: ChainId) {
  return rChainId ? networks[rChainId].imageBaseUrl ?? '' : ''
}

export function getIsUserCloseToLiquidation(
  userFirstBand: number,
  userLiquidationBand: number | null,
  activeBand: number | null | undefined
) {
  if (typeof userLiquidationBand !== null && activeBand === null) {
    return false
  } else if (typeof activeBand !== 'undefined' && activeBand !== null) {
    return userFirstBand <= activeBand + 2
  }
  return false
}

export function getLiquidationStatus(
  healthNotFull: string,
  userIsCloseToLiquidation: boolean,
  userStateStablecoin: string
) {
  let userStatus: { label: string; colorKey: HeathColorKey; tooltip: string } = {
    label: 'Healthy',
    colorKey: 'healthy',
    tooltip: '',
  }

  if (+healthNotFull < 0) {
    userStatus.label = 'Hard liquidation'
    userStatus.colorKey = 'hard_liquidation'
    userStatus.tooltip =
      'Hard liquidation is like a usual liquidation, which can happen only if you experience significant losses in soft liquidation so that you get below 0 health.'
  } else if (+userStateStablecoin > 0) {
    userStatus.label = 'Soft liquidation'
    userStatus.colorKey = 'soft_liquidation'
    userStatus.tooltip =
      'Soft liquidation is the initial process of collateral being converted into stablecoin, you may experience some degree of loss.'
  } else if (userIsCloseToLiquidation) {
    userStatus.label = 'Close to liquidation'
    userStatus.colorKey = 'close_to_liquidation'
  }

  return userStatus
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
  llamma: Llamma
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

  let parsedBandBalances = []
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
  const sortedKeys = sortBy(Object.keys(bandBalances), (k) => +k)
  const bandBalancesArr = []
  for (const k of sortedKeys) {
    bandBalancesArr.push({ ...bandBalances[k], band: k })
  }
  return { bandBalancesArr, bandBalances }
}

export function getWalletProvider(wallet: Wallet) {
  if ('isTrustWallet' in wallet.provider) {
    // unable to connect to curvejs with wallet.provider
    return window.ethereum
  } else if ('isExodus' in wallet.provider && typeof window.exodus.ethereum !== 'undefined') {
    return window.exodus.ethereum
  }
  return wallet.provider
}

export function parseUserLoss(userLoss: UserLoanDetails['userLoss']) {
  const smallAmount = 0.00000001
  let resp = cloneDeep(userLoss)
  resp.loss = resp.loss && BN(resp.loss).isLessThan(smallAmount) ? '0' : userLoss.loss
  resp.loss_pct = resp.loss_pct && BN(resp.loss_pct).isLessThan(smallAmount) ? '0' : userLoss.loss_pct

  return resp
}
