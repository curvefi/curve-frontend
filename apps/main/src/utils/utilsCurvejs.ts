import cloneDeep from 'lodash/cloneDeep'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import networks from '@/networks'

export async function initCurveJs(chainId: ChainId, wallet: Wallet | null) {
  let curveApi: CurveApi | undefined
  const { networkId, rpcUrl } = networks[chainId] ?? {}

  if (networkId) {
    curveApi = cloneDeep((await import('@curvefi/api')).default) as CurveApi

    if (wallet) {
      await curveApi.init('Web3', { network: networkId, externalProvider: getWalletProvider(wallet) }, { chainId })
      return curveApi
    } else if (rpcUrl) {
      await curveApi.init('JsonRpc', { url: rpcUrl }, { chainId })
      return curveApi
    }
  }
}

export function hasNoWrapped(pool: Pool) {
  return pool?.isPlain || pool?.isFake
}

export function filterRewardsApy<T extends { apy: number | string }>(rewards: T[]) {
  if (Array.isArray(rewards)) {
    return rewards.filter((r) => Number(r.apy) !== 0)
  }
  return []
}

export function separateCrvReward<T extends { symbol: string; apy: number | string }>(rewards: T[]) {
  if (Array.isArray(rewards)) {
    const crvIdx = rewards.findIndex((r) => r.symbol === 'CRV')

    if (crvIdx !== -1) {
      const crvReward = rewards.splice(crvIdx, 1)
      return [rewards, [crvReward[0].apy]]
    }
  }
  return [rewards, []]
}

export function haveRewardsApy({ base, other, crv }: Partial<RewardsApy>) {
  const haveBase = base !== undefined
  const [crvMin, crvMax] = crv || ['', '']
  const haveCrv = Number(crvMin) > 0 || Number(crvMax) > 0
  const haveOther = Array.isArray(other) && other.length > 0

  return { haveBase, haveCrv, haveOther }
}

export function rewardsApyCrvText([base, boosted]: number[]) {
  if (!base && !boosted) return ''
  const formattedBase = formatNumber(base, FORMAT_OPTIONS.PERCENT)

  if (!!boosted) {
    return `${formattedBase} → ${formatNumber(boosted, FORMAT_OPTIONS.PERCENT)} CRV`
  } else {
    return `${formattedBase} CRV`
  }
}

// profits
export function filterCrvProfit<T extends { day: string; week: string; month: string; year: string }>(crvProfit: T) {
  // @ts-ignore
  const haveCrvProfit = ['day', 'week', 'month', 'year'].some((t) => Number(crvProfit[t]) > 0)
  return haveCrvProfit ? crvProfit : null
}

export function separateCrvProfit<T extends { symbol: string }>(tokensProfit: T[]) {
  if (Array.isArray(tokensProfit)) {
    const crvIdx = tokensProfit.findIndex((r) => r.symbol === 'CRV')

    if (crvIdx !== -1) {
      const crvProfit = tokensProfit.splice(crvIdx, 1)
      return { crvProfit: crvProfit[0], tokensProfit }
    }
  }

  return { crvProfit: null, tokensProfit }
}

export function isValidWalletAddress(address: string) {
  return address && address.length === 42 && address.toLowerCase().startsWith('0x')
}

export function getImageBaseUrl(rChainId: ChainId) {
  return rChainId ? networks[rChainId].imageBaseUrl ?? '' : ''
}

export function getVolumeTvlStr(mapper: VolumeMapper | TvlMapper) {
  let values = []
  for (const key in mapper) {
    const obj = mapper[key]
    const wholeVal = obj.value.split('.')[0]
    if (wholeVal && +wholeVal > 0) {
      values.push(wholeVal)
    }
  }

  if (values.length === 0 && typeof mapper !== 'undefined') {
    return '0'
  } else {
    return values.join('.')
  }
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

export function parseBaseProfit(baseProfit: { day: string; week: string; month: string; year: string }) {
  const { day, week, month, year } = baseProfit ?? {}
  return {
    day: day && +day > 0 ? day : '',
    week: week && +week > 0 ? week : '',
    month: month && +month > 0 ? month : '',
    year: year && +year > 0 ? year : '',
  }
}
