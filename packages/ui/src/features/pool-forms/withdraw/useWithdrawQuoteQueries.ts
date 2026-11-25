import type { Decimal } from '@primitives/decimal.utils'
import { getPoolAmounts, poolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import { calculateMinimumReceived } from '@ui/features/pool-forms/swap/swap.utils'
import { combineQueries } from '@ui/features/queries/combine'
import {
  mapQuery,
  q,
  toQuery,
  type FieldsOrQueries,
  type Query,
  type QueryOrValue,
  type QueryProp,
} from '@ui/features/queries/util'
import type { OneCoinWithdrawQuoteQuery } from './one-coin-withdraw-quote'
import { getOneCoinWithdrawParams, type OneCoinWithdrawFormValues } from './withdraw-form.utils'

type QueryHook<P extends object, R> = (params: FieldsOrQueries<P>, enabled?: boolean) => Query<R>

export const useWithdrawQuoteQueries = <TPoolParams extends object>({
  poolParams,
  values,
  debounced,
  isDebouncing,
  decimals,
  lpBalance,
  enabled = true,
  useWithdrawMaxAmount,
  useWithdrawOneCoinQuote,
  useWithdrawPriceImpact,
}: {
  poolParams: TPoolParams
  values: OneCoinWithdrawFormValues
  debounced: OneCoinWithdrawFormValues
  isDebouncing: boolean
  decimals: QueryOrValue<number>[] | undefined
  lpBalance: QueryProp<Decimal>
  enabled?: boolean
  useWithdrawMaxAmount: QueryHook<TPoolParams & { index: number; decimals: number; lpAmount: Decimal }, Decimal>
  useWithdrawOneCoinQuote: QueryHook<TPoolParams & OneCoinWithdrawQuoteQuery, { lpAmount: Decimal; amount: Decimal }>
  useWithdrawPriceImpact: (
    params: TPoolParams & FieldsOrQueries<ReturnType<typeof getOneCoinWithdrawParams>>,
    expectedLp: QueryProp<Decimal>,
  ) => Query<Decimal | null>
}) => {
  const index = values.tokenIndex
  const tokenDecimals = decimals?.map(precision => toQuery(precision))
  const poolDecimals = tokenDecimals && combineQueries(tokenDecimals, (...values) => values)
  const max = q(
    useWithdrawMaxAmount({ ...poolParams, index, decimals: decimals?.[index], lpAmount: lpBalance }, enabled),
  )
  const estimated = useWithdrawOneCoinQuote(
    {
      ...poolParams,
      amount: isDebouncing || values.isMax ? undefined : debounced.amount,
      supply: values.supply,
      decimals: poolDecimals,
      index,
      slippage: values.slippage,
    },
    enabled,
  )
  const quote = values.isMax
    ? combineQueries([max, lpBalance], (amount, lpAmount) => ({ lpAmount, amount }))
    : q(estimated)
  const expectedLp = mapQuery(quote, quote => quote.lpAmount)
  const quotedAmount = mapQuery(quote, quote => quote.amount)
  const minimumReceived = combineQueries([quotedAmount, toQuery(decimals?.[index])], (amount, precision) =>
    calculateMinimumReceived(amount, values.slippage, precision),
  )
  const params = {
    ...getOneCoinWithdrawParams(debounced),
    expectedLp,
    lpAmount: expectedLp,
    maxLpAmount: lpBalance,
    decimals: poolDecimals,
    amounts: combineQueries([quotedAmount, toQuery(poolDecimals)], (amount, decimals) =>
      getPoolAmounts({ [poolAmountField(index)]: amount }, decimals.length),
    ),
    ...poolParams,
  }
  const priceImpact = combineQueries([useWithdrawPriceImpact(params, expectedLp), expectedLp], impact => impact)
  return { max, expectedLp, quotedAmount, minimumReceived, params, priceImpact }
}
