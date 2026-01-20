import { RewardsApy } from '@/dex/types/main.types'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'

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

  if (boosted) {
    return `${formattedBase} → ${formatNumber(boosted, FORMAT_OPTIONS.PERCENT)} CRV`
  } else {
    return `${formattedBase} CRV`
  }
}

// profits
export function filterCrvProfit<T extends { day: string; week: string; month: string; year: string }>(crvProfit: T) {
  const haveCrvProfit = (['day', 'week', 'month', 'year'] as const).some((t) => Number(crvProfit[t]) > 0)
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

export function parseBaseProfit(baseProfit: { day: string; week: string; month: string; year: string }) {
  const { day, week, month, year } = baseProfit ?? {}
  return {
    day: day && +day > 0 ? day : '',
    week: week && +week > 0 ? week : '',
    month: month && +month > 0 ? month : '',
    year: year && +year > 0 ? year : '',
  }
}
