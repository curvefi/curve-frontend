import { rateAdjustedValue } from '@/stellar/lib/amounts'
import { usePoolRates } from '@/stellar/queries/pool/pool-rates.query'
import { usePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import type { QuoteParams } from '@/stellar/queries/validation/liquidity.validation'
import { isComplete } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { scaleReserves } from '@ui/features/pool-forms/balanced-amounts.utils'
import { combineQueries } from '@ui/features/queries/combine'
import type { Query } from '@ui/features/queries/util'
import { calculatePriceImpact } from '@ui/lib/price-impact.util'

export function useWithdrawPriceImpact(params: QuoteParams, expectedBurn: Query<Decimal>) {
  const reserves = usePoolReserves(params)
  const rates = usePoolRates(params)
  return combineQueries([reserves, rates, expectedBurn], (reserves, rates, burn) => {
    const { amounts, decimals, supply } = params
    if (!amounts || !isComplete(decimals) || !supply || !+supply) return null
    const balanced = scaleReserves(reserves, decimals, burn, supply)
    const balancedValue = rateAdjustedValue(balanced, rates, decimals)
    return calculatePriceImpact(rateAdjustedValue(amounts, rates, decimals), balancedValue)
  })
}
