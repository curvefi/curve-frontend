import { usePoolRates } from '@/stellar/queries/pool/pool-rates.query'
import type { PoolDecimalsParams } from '@/stellar/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import type { SwapFormValues } from '@ui/features/pool-forms/swap/swap-form.utils'
import { getLowExchangeRateWarning, isLowExchangeRate } from '@ui/features/pool-forms/swap/swap.utils'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'

export const useSwapLowExchangeRate = (
  params: PoolDecimalsParams & Pick<SwapFormValues, 'fromIndex' | 'toIndex'>,
  exchangeRate: QueryProp<Decimal>,
) => {
  const lowRate = mapQuery(exchangeRate, isLowExchangeRate)
  const storedRates = usePoolRates(params, lowRate.data === true)
  return getLowExchangeRateWarning(lowRate, storedRates, params)
}
