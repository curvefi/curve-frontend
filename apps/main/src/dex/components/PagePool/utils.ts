import { shortenTokenName } from '@/dex/utils'
import { Balances } from '@/dex/types/main.types'

export type Amount = {
  value: string
  touched?: boolean
  token: string
  tokenAddress: string
}

export function parseAmountsForAPI(amounts: Amount[]) {
  return amounts.map((a) => (Number(a.value) > 0 ? a.value : '0'))
}

export function getAmountsError(amounts: Amount[], balances: Balances) {
  return [...amounts]
    .filter((a) => {
      const userBalance = balances?.[a.tokenAddress]
      return +(a.value || '0') > +(userBalance || '0')
    })
    .map((a) => shortenTokenName(a.token))
    .join(', ')
}

export function amountsDescription(amounts: Amount[]) {
  return amounts
    .filter((a) => !!Number(a.value))
    .map((a) => `${a.value} ${a.token}`)
    .join(', ')
}

export function tokensDescription(amounts: Amount[]) {
  return amounts
    .filter((a) => !!Number(a.value))
    .map((a) => `${a.token}`)
    .join(', ')
}
