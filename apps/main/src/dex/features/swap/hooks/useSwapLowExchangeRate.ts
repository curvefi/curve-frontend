import { usePoolStoredRates } from '@/dex/features/liquidity-density/queries/pool-stored-rates.query'
import { usePoolContext } from '@/dex/features/pool-context'
import { excludeLowExchangeRateCheck } from '@/dex/utils/utilsSwap'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { SwapFormValues } from '@ui/features/pool-forms/swap/swap-form.utils'
import { isLowExchangeRate } from '@ui/features/pool-forms/swap/swap.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { type QueryProp } from '@ui/features/queries/util'
import { decimalEqual } from '@ui/lib/decimal'

export const useSwapLowExchangeRate = ({
  tokenAddresses,
  fromIndex,
  toIndex,
  exchangeRate,
}: Pick<SwapFormValues, 'fromIndex' | 'toIndex'> & { tokenAddresses: Address[]; exchangeRate: QueryProp<Decimal> }) => {
  const { chainId, poolAddress, pool } = usePoolContext()
  const lowRate = combineQueries(
    [pool, exchangeRate],
    (pool, exchangeRate) =>
      !pool.isCrypto &&
      isLowExchangeRate(exchangeRate) &&
      !excludeLowExchangeRateCheck(tokenAddresses[fromIndex], tokenAddresses[toIndex], []),
  )
  const storedRates = usePoolStoredRates({ chainId, poolAddress }, lowRate.data === true)

  // Curve.js normalizes rates to token precision; rate-bearing tokens don't need to trade 1:1.
  return lowRate.data
    ? combineQueries([storedRates, lowRate], rates => !rates?.some(rate => !decimalEqual(rate, '1')))
    : lowRate
}
