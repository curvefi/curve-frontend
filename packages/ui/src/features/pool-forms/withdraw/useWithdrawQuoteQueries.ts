import type { Decimal } from '@primitives/decimal.utils'
import { combineQueries } from '@ui/features/queries/combine'
import {
  mapQuery,
  q,
  toValue,
  type DeepPartial,
  type Query,
  type QueryOrValue,
  type QueryProp,
} from '@ui/features/queries/util'
import type { FieldsOf } from '@ui/lib/validation/types'
import type { OneCoinWithdrawQuoteQuery } from './one-coin-withdraw-quote'
import { getOneCoinWithdrawParams, type OneCoinWithdrawFormValues } from './withdraw-form.utils'

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
  useWithdrawMaxAmount: (
    params: TPoolParams & { index: number; decimals: QueryOrValue<number> | undefined; lpAmount: QueryProp<Decimal> },
    enabled?: boolean,
  ) => Query<Decimal>
  useWithdrawOneCoinQuote: (
    params: TPoolParams & FieldsOf<DeepPartial<OneCoinWithdrawQuoteQuery>>,
    enabled?: boolean,
  ) => Query<{ lpAmount: Decimal; amount: Decimal }>
  useWithdrawPriceImpact: (
    params: TPoolParams & ReturnType<typeof getOneCoinWithdrawParams>,
    expectedLp: QueryProp<Decimal>,
  ) => Query<Decimal | null>
}) => {
  const index = values.tokenIndex
  const max = q(
    useWithdrawMaxAmount({ ...poolParams, index, decimals: decimals?.[index], lpAmount: lpBalance }, enabled),
  )
  const estimated = useWithdrawOneCoinQuote(
    {
      ...poolParams,
      amount: isDebouncing || values.isMax ? undefined : debounced.amount,
      maxLpAmount: lpBalance.data,
      decimals: decimals?.map(toValue),
      index,
      slippage: values.slippage,
    },
    enabled,
  )
  const quote = values.isMax
    ? combineQueries([max, lpBalance], (amount, lpAmount) => ({ lpAmount, amount }))
    : q(estimated)
  const expectedLp = mapQuery(quote, quote => quote.lpAmount)
  const quotedAmount = quote.data?.amount
  const params = {
    ...getOneCoinWithdrawParams({ ...debounced, expectedLp: expectedLp.data, quotedAmount }),
    ...poolParams,
  }
  const priceImpact = combineQueries([useWithdrawPriceImpact(params, expectedLp), expectedLp], impact => impact)
  return { max, expectedLp, quotedAmount, params, priceImpact }
}
