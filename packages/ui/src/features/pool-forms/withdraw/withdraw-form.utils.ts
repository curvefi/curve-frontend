import type { Decimal } from '@primitives/decimal.utils'
import { decimal } from '@ui/lib/decimal'
import { getPoolAmounts, getPoolMaxAmounts, poolAmountField, type PoolTokenFields } from '../pool-form.utils'

export type WithdrawMode = 'balanced' | 'unbalanced' | 'one-coin'

export const oneCoinWithdrawDefaultValues = { amount: decimal(undefined), isMax: false }

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

export type OneCoinWithdrawValues = Pick<WithdrawQuoteFields, 'isWrapped' | 'slippage'> & {
  amount: Decimal | undefined
  isMax: boolean
  tokenIndex: number
}

export type OneCoinWithdrawComputed = Omit<WithdrawQuoteFields, 'isWrapped' | 'slippage'> & {
  quotedAmount: Decimal | undefined
  poolReserve: Decimal | undefined
}

export type OneCoinWithdrawFormValues = OneCoinWithdrawValues & Partial<OneCoinWithdrawComputed>

export type AdvancedWithdrawFormValues = WithdrawQuoteFields &
  PoolTokenFields & { lpAmount: Decimal | undefined; isBalanced: boolean }

/** The resolved quote supplies the LP burn for both manual amounts and Max. */
export const getOneCoinWithdrawParams = ({
  tokenIndex,
  quotedAmount,
  poolReserve,
  ...values
}: OneCoinWithdrawFormValues) => ({
  ...values,
  mode: 'one-coin' as const,
  tokenIndex,
  lpAmount: values.expectedLp,
  amounts: getPoolAmounts({ [poolAmountField(tokenIndex)]: quotedAmount }, values.decimals?.length),
  maxAmounts: getPoolAmounts({ [poolAmountField(tokenIndex)]: poolReserve }, values.decimals?.length),
})

export const getAdvancedWithdrawParams = (values: AdvancedWithdrawFormValues) => ({
  ...values,
  mode: values.isBalanced ? ('balanced' as const) : ('unbalanced' as const),
  tokenIndex: undefined,
  amounts: getPoolAmounts(values, values.decimals?.length),
  maxAmounts: getPoolMaxAmounts(values, values.decimals?.length),
})
