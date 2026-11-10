import { rateAdjustedValue } from '@/stellar/lib/amounts'
import { usePoolRates } from '@/stellar/queries/pool/pool-rates.query'
import { usePoolSnapshot } from '@/stellar/queries/pool/pool-snapshot.query'
import type { QuoteParams } from '@/stellar/queries/validation/liquidity.validation'
import { isComplete } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { scaleReserves } from '@ui/features/pool-forms/balanced-amounts.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { type Query } from '@ui/features/queries/util'
import { calculatePriceImpact } from '@ui/lib/price-impact.util'

export function useWithdrawPriceImpact(params: QuoteParams, expectedLp: Query<Decimal>) {
  const snapshot = usePoolSnapshot(params)
  const { amounts, decimals } = params
  const rates = usePoolRates(params)
  return combineQueries([snapshot, rates, expectedLp], ({ active_balances, lp_supply }, rates, lpAmount) => {
    if (!amounts || !isComplete(decimals) || !+lp_supply) return null
    const balanced = scaleReserves(active_balances, decimals, lpAmount, lp_supply)
    const balancedValue = rateAdjustedValue(balanced, rates)
    return calculatePriceImpact(rateAdjustedValue(amounts, rates), balancedValue)
  })
}
