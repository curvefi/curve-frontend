import type { Decimal } from '@primitives/decimal.utils'
import { getPoolAmounts, getPoolMaxAmounts, type PoolTokenFields } from '../pool-form.utils'

export type WithdrawMode = 'balanced' | 'unbalanced' | 'one-coin'

export type WithdrawMutation = {
  amounts: (Decimal | undefined)[]
  maxAmounts: (Decimal | undefined)[]
  mode: WithdrawMode
  tokenIndex: number | undefined
  decimals: number[]
  lpAmount: Decimal | undefined
  maxLpAmount: Decimal
  slippage: Decimal
  supply: Decimal
  seedLock: Decimal
  maximumBurn: Decimal
}

type WithdrawQuoteFields = {
  isWrapped?: boolean
  decimals: (number | undefined)[] | undefined
  maxLpAmount: Decimal | undefined
  supply: Decimal | undefined
  seedLock: Decimal | undefined
  maximumBurn: Decimal | undefined
  slippage: Decimal
}

export type OneCoinWithdrawFormValues = WithdrawQuoteFields & {
  amount: Decimal | undefined
  lpAmount: Decimal | undefined
  quotedAmount: Decimal | undefined
  isMax: boolean
  tokenIndex: number
  poolReserve: Decimal | undefined
}

export type AdvancedWithdrawFormValues = WithdrawQuoteFields &
  PoolTokenFields & { lpAmount: Decimal | undefined; isBalanced: boolean }

/** Manual amounts use the quoted LP burn; Max burns the full balance. */
export const getOneCoinWithdrawParams = (values: OneCoinWithdrawFormValues) => ({
  ...values,
  mode: 'one-coin' as const,
  lpAmount: values.isMax ? values.maxLpAmount : values.lpAmount,
  amounts: values.decimals?.map((_, index) => (index === values.tokenIndex ? values.quotedAmount : '0')),
  maxAmounts: values.decimals?.map((_, index) => (index === values.tokenIndex ? values.poolReserve : '0')),
})

export const getAdvancedWithdrawParams = (values: AdvancedWithdrawFormValues) => ({
  ...values,
  mode: values.isBalanced ? ('balanced' as const) : ('unbalanced' as const),
  tokenIndex: undefined,
  amounts: getPoolAmounts(values, values.decimals?.length),
  maxAmounts: getPoolMaxAmounts(values, values.decimals?.length),
})
