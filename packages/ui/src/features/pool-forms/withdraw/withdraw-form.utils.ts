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
}

type WithdrawQuoteFields = {
  isWrapped?: boolean
  decimals: (number | undefined)[] | undefined
  maxLpAmount: Decimal | undefined
  supply: Decimal | undefined
  seedLock: Decimal | undefined
  expectedLp: Decimal | undefined
  slippage: Decimal
}

export type OneCoinWithdrawFormValues = WithdrawQuoteFields & {
  amount: Decimal | undefined
  isMax: boolean
  tokenIndex: number
  poolReserve: Decimal | undefined
}

export type AdvancedWithdrawFormValues = WithdrawQuoteFields &
  PoolTokenFields & { lpAmount: Decimal | undefined; isBalanced: boolean }

/** Max burns the full LP balance; a custom token amount uses an imbalance withdrawal. */
export const getOneCoinWithdrawParams = ({
  amount,
  isMax,
  tokenIndex,
  poolReserve,
  ...values
}: OneCoinWithdrawFormValues) => ({
  ...values,
  mode: isMax ? ('one-coin' as const) : ('unbalanced' as const),
  tokenIndex,
  lpAmount: isMax ? values.maxLpAmount : undefined,
  amounts: values.decimals?.map((_, index) => (index === tokenIndex ? amount : '0')),
  maxAmounts: values.decimals?.map((_, index) => (index === tokenIndex ? poolReserve : '0')),
})

export const getAdvancedWithdrawParams = (values: AdvancedWithdrawFormValues) => ({
  ...values,
  mode: values.isBalanced ? ('balanced' as const) : ('unbalanced' as const),
  tokenIndex: undefined,
  amounts: getPoolAmounts(values, values.decimals?.length),
  maxAmounts: getPoolMaxAmounts(values, values.decimals?.length),
})
