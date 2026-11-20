import { useWithdrawPriceImpact } from '@/dex/queries/withdraw/withdraw-bonus.query'
import { useWithdrawMaxAmount } from '@/dex/queries/withdraw/withdraw-max-amounts.query'
import { useWithdrawOneCoinQuote } from '@/dex/queries/withdraw/withdraw-one-coin-quote.query'
import type { Decimal } from '@primitives/decimal.utils'
import { getOneCoinWithdrawQuote } from '@ui/features/pool-forms/withdraw/one-coin-withdraw-quote.utils'
import type { OneCoinWithdrawFormValues } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { q, type QueryProp } from '@ui/features/queries/util'
import type { WithdrawQuoteParams } from '../types'

export const useWithdrawQuoteQueries = ({
  values,
  debounced,
  isDebouncing,
  decimals,
  lpBalance,
  enabled,
  ...poolParams
}: Pick<WithdrawQuoteParams, 'chainId' | 'poolAddress' | 'isWrapped' | 'userAddress'> & {
  values: OneCoinWithdrawFormValues
  debounced: OneCoinWithdrawFormValues
  isDebouncing: boolean
  decimals: number[] | undefined
  lpBalance: QueryProp<Decimal>
  enabled: boolean
}) => {
  const index = values.tokenIndex
  const max = q(useWithdrawMaxAmount({ ...poolParams, index, lpAmount: lpBalance }, enabled))
  const estimated = useWithdrawOneCoinQuote(
    {
      ...poolParams,
      amount: isDebouncing || values.isMax ? undefined : debounced.amount,
      maxLpAmount: lpBalance.data,
      decimals,
      index,
      slippage: values.slippage,
    },
    enabled,
  )
  const quote = getOneCoinWithdrawQuote({ values: debounced, isMax: values.isMax, max, lpBalance, estimated })
  const params: WithdrawQuoteParams = { ...quote.params, ...poolParams }
  const priceImpact = combineQueries([useWithdrawPriceImpact(params), quote.expectedLp], impact => impact)
  return { max, ...quote, params, priceImpact }
}
