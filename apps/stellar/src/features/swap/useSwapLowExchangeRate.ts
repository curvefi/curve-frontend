import { usePoolRates } from '@/stellar/queries/pool/pool-rates.query'
import type { PoolDecimalsParams } from '@/stellar/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import { isLowExchangeRate } from '@ui/features/pool-forms/swap/swap.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { decimalEqual } from '@ui/lib/decimal'

export const useSwapLowExchangeRate = (params: PoolDecimalsParams, exchangeRate: QueryProp<Decimal>) => {
  const lowRate = mapQuery(exchangeRate, isLowExchangeRate)
  const storedRates = usePoolRates(params, lowRate.data === true)
  return lowRate.data
    ? combineQueries([storedRates, lowRate], rates => !rates.some(rate => !decimalEqual(rate, '1')))
    : lowRate
}
