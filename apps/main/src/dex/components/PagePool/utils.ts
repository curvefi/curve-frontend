import type { EstimatedGas, Slippage } from '@/dex/components/PagePool/types'
import { shortenTokenName } from '@/dex/utils'
import type { IDict } from '@curvefi/api/lib/interfaces'

export type Amount = {
  value: string
  touched?: boolean
  token: string
  tokenAddress: string
}

export function parseAmountsForAPI(amounts: Amount[]) {
  return amounts.map((a) => (Number(a.value) > 0 ? a.value : '0'))
}

export function getAmountsError(amounts: Amount[], balances: IDict<string>) {
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

export const DEFAULT_SLIPPAGE: Slippage = {
  loading: false,
  slippage: null,
  isHighSlippage: false,
  isBonus: false,
  error: '',
}

export const DEFAULT_ESTIMATED_GAS: EstimatedGas = { loading: false, estimatedGas: null, error: null }
