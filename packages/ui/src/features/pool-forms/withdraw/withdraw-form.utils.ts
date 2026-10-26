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
  expected: Decimal
}

type WithdrawQuoteFields = {
  decimals: (number | undefined)[] | undefined
  maxLpAmount: Decimal | undefined
  supply: Decimal | undefined
  seedLock: Decimal | undefined
  maximumBurn: Decimal | undefined
  slippage: Decimal
}

export type OneCoinWithdrawFormValues = WithdrawQuoteFields & {
  amount: Decimal | undefined
  tokenIndex: number
  isMax: boolean
  maxAmount: Decimal | undefined
}

export type AdvancedWithdrawFormValues = WithdrawQuoteFields &
  PoolTokenFields & { lpAmount: Decimal | undefined; isBalanced: boolean }

export const getOneCoinWithdrawParams = ({
  amount,
  tokenIndex,
  isMax,
  maxAmount,
  ...quote
}: OneCoinWithdrawFormValues) => ({
  ...quote,
  mode: isMax ? ('one-coin' as const) : ('unbalanced' as const),
  tokenIndex,
  lpAmount: isMax ? quote.maxLpAmount : undefined,
  amounts: quote.decimals?.map((_, index) => (index === tokenIndex ? amount : '0')),
  maxAmounts: quote.decimals?.map((_, index) => (index === tokenIndex ? maxAmount : '0')),
})

export const getAdvancedWithdrawParams = (values: AdvancedWithdrawFormValues) => ({
  ...values,
  mode: values.isBalanced ? ('balanced' as const) : ('unbalanced' as const),
  tokenIndex: undefined,
  amounts: getPoolAmounts(values, values.decimals?.length),
  maxAmounts: getPoolMaxAmounts(values, values.decimals?.length),
})
