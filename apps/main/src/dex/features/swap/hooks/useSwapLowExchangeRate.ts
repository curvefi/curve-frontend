import { usePoolStoredRates } from '@/dex/features/liquidity-density/queries/pool-stored-rates.query'
import { usePoolContext } from '@/dex/features/pool-context'
import { excludeLowExchangeRateCheck } from '@/dex/utils/utilsSwap'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { SwapFormValues } from '@ui/features/pool-forms/swap/swap-form.utils'
import { getLowExchangeRateWarning, isLowExchangeRate } from '@ui/features/pool-forms/swap/swap.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { type QueryProp } from '@ui/features/queries/util'

export const useSwapLowExchangeRate = ({
  tokenAddresses,
  fromIndex,
  toIndex,
  isWrapped,
  exchangeRate,
}: Pick<SwapFormValues, 'fromIndex' | 'toIndex' | 'isWrapped'> & {
  tokenAddresses: Address[]
  exchangeRate: QueryProp<Decimal>
}) => {
  const { chainId, poolAddress, pool } = usePoolContext()
  const lowRate = combineQueries(
    [pool, exchangeRate],
    (pool, exchangeRate) =>
      !pool.isCrypto &&
      isLowExchangeRate(exchangeRate) &&
      !excludeLowExchangeRateCheck(tokenAddresses[fromIndex], tokenAddresses[toIndex]),
  )
  const storedRates = usePoolStoredRates({ chainId, poolAddress, isWrapped }, lowRate.data === true)

  return getLowExchangeRateWarning(lowRate, storedRates, { fromIndex, toIndex })
}
