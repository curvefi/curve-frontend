import { useWithdrawMaxAmount } from '@/stellar/queries/withdraw/withdraw-max-amounts.query'
import { useWithdrawOneCoinQuote } from '@/stellar/queries/withdraw/withdraw-one-coin-quote.query'
import type { Decimal } from '@primitives/decimal.utils'
import { getOneCoinWithdrawQuote } from '@ui/features/pool-forms/withdraw/one-coin-withdraw-quote.utils'
import type { OneCoinWithdrawFormValues } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { q, type QueryProp } from '@ui/features/queries/util'
import type { WithdrawQuoteParams } from './types'
import { useWithdrawPriceImpact } from './useWithdrawPriceImpact'

export const useWithdrawQuoteQueries = ({
  values,
  debounced,
  isDebouncing,
  decimals,
  lpBalance,
  ...poolParams
}: Pick<WithdrawQuoteParams, 'network' | 'pool' | 'account'> & {
  values: OneCoinWithdrawFormValues
  debounced: OneCoinWithdrawFormValues
  isDebouncing: boolean
  decimals: QueryProp<number>[] | undefined
  lpBalance: QueryProp<Decimal>
}) => {
  const index = values.tokenIndex
  const max = q(useWithdrawMaxAmount({ ...poolParams, index, decimals: decimals?.[index], lpAmount: lpBalance }))
  const estimated = useWithdrawOneCoinQuote({
    ...poolParams,
    amount: isDebouncing || values.isMax ? undefined : debounced.amount,
    maxLpAmount: lpBalance.data,
    decimals: decimals?.map(query => query.data),
    index,
    slippage: values.slippage,
  })
  const quote = getOneCoinWithdrawQuote({ values: debounced, isMax: values.isMax, max, lpBalance, estimated })
  const params: WithdrawQuoteParams = { ...quote.params, ...poolParams }
  const priceImpact = useWithdrawPriceImpact(params, quote.expectedLp)
  return { max, ...quote, params, priceImpact }
}
