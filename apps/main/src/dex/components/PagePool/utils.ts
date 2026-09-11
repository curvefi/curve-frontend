import type { EstimatedGas, Slippage, TransferTabsParams } from '@/dex/components/PagePool/types'
import { PoolData } from '@/dex/types/main.types'
import { shortenTokenName } from '@/dex/utils'
import type { IDict } from '@curvefi/api/lib/interfaces'
import { maybe } from '@primitives/objects.utils'
import type { SlippageType } from '@ui/features/slippage/slippage.utils'

export type Amount = { value: string; touched?: boolean; token: string; tokenAddress: string }

export const parseAmountsForAPI = (amounts: Amount[]) => amounts.map(a => (Number(a.value) > 0 ? a.value : '0'))

export const getAmountsError = (amounts: Amount[], balances: IDict<string>) =>
  [...amounts]
    .filter(a => {
      const userBalance = balances?.[a.tokenAddress]
      return +(a.value || '0') > +(userBalance || '0')
    })
    .map(a => shortenTokenName(a.token))
    .join(', ')

export const amountsDescription = (amounts: Amount[]) =>
  amounts
    .filter(a => !!Number(a.value))
    .map(a => `${a.value} ${a.token}`)
    .join(', ')

export const tokensDescription = (amounts: Amount[]) =>
  amounts
    .filter(a => !!Number(a.value))
    .map(a => `${a.token}`)
    .join(', ')

export const DEFAULT_SLIPPAGE: Slippage = {
  loading: false,
  slippage: null,
  isHighSlippage: false,
  isBonus: false,
  error: '',
}

export const DEFAULT_ESTIMATED_GAS: EstimatedGas = { loading: false, estimatedGas: null, error: null }

export const getSlippageType = <T extends PoolData | undefined>(poolData: T) =>
  maybe(poolData, ({ pool }): SlippageType => (pool.isCrypto ? 'crypto' : 'stable'))

export const getDepositTabAlert = ({ poolAlert }: TransferTabsParams) => poolAlert?.isDisableDeposit && poolAlert

export const getWithdrawTabAlert = ({ poolAlert }: TransferTabsParams) => poolAlert?.isDisableWithdrawOnly && poolAlert

export const getSwapTabAlert = ({ poolAlert }: TransferTabsParams) => poolAlert?.isDisableSwap && poolAlert
