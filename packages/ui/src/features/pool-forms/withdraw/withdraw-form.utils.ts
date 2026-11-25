import type { Decimal } from '@primitives/decimal.utils'
import { maybes, notFalsy, type Nullish } from '@primitives/objects.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { toQuery, type QueryOrValue, type QueryProp } from '@ui/features/queries/util'
import { getPoolAmounts, getPoolMaxAmounts, poolAmountField, type PoolTokenFields } from '../pool-form.utils'
import type { PoolToken } from '../PoolTokenInput'
import { calculateMinimumReceived } from '../swap/swap.utils'

export type WithdrawMode = 'balanced' | 'unbalanced' | 'one-coin'

export const oneCoinWithdrawDefaultValues = { amount: undefined, isMax: false }

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
  quotedAmount: Decimal | undefined
  isMax: boolean
  tokenIndex: number
  poolReserve: Decimal | undefined
}

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

export const getWithdrawMinimumAmounts = (
  {
    mode,
    amounts,
    decimals,
    slippage,
    tokenIndex,
  }: Pick<WithdrawMutation, 'mode' | 'slippage'> & {
    amounts?: QueryOrValue<(Decimal | undefined)[]> | Nullish
    decimals?: QueryOrValue<(number | undefined)[]> | Nullish
    tokenIndex?: number | Nullish
  },
  tokens: QueryProp<PoolToken>[] | undefined,
  expectedLp: QueryProp<Decimal>,
) =>
  tokens?.flatMap((token, index) =>
    notFalsy(
      (mode === 'balanced' || (mode === 'one-coin' && index === tokenIndex)) && {
        index,
        value: combineQueries(
          [token, expectedLp, toQuery(amounts), toQuery(decimals)],
          ({ symbol }, _, amounts, decimals) =>
            maybes([amounts?.[index], decimals?.[index]], (amount, precision) => ({
              amount: calculateMinimumReceived(amount, slippage, precision),
              symbol,
            })),
        ),
      },
    ),
  )
