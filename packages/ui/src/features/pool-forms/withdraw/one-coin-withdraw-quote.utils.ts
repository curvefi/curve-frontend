import type { Decimal } from '@primitives/decimal.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, q, type Query } from '@ui/features/queries/util'
import { getOneCoinWithdrawParams, type OneCoinWithdrawFormValues } from './withdraw-form.utils'

export const getOneCoinWithdrawQuote = ({
  values,
  isMax,
  max,
  lpBalance,
  estimated,
}: {
  values: OneCoinWithdrawFormValues
  isMax: boolean
  max: Query<Decimal>
  lpBalance: Query<Decimal>
  estimated: Query<{ lpAmount: Decimal; amount: Decimal }>
}) => {
  const quote = isMax ? combineQueries([max, lpBalance], (amount, lpAmount) => ({ lpAmount, amount })) : q(estimated)
  const expectedLp = mapQuery(quote, quote => quote.lpAmount)
  const quotedAmount = quote.data?.amount
  return {
    expectedLp,
    quotedAmount,
    params: getOneCoinWithdrawParams({ ...values, expectedLp: expectedLp.data, quotedAmount }),
  }
}
