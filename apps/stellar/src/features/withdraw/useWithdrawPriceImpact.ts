import { rateAdjustedValue } from '@/stellar/lib/amounts'
import { usePoolRates } from '@/stellar/queries/pool/pool-rates.query'
import { usePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import type { QuoteParams } from '@/stellar/queries/validation/liquidity.validation'
import { isComplete } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { scaleReserves } from '@ui/features/pool-forms/balanced-amounts.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, type Query } from '@ui/features/queries/util'
import { ZERO } from '@ui/lib/decimal'
import { calculatePriceImpact } from '@ui/lib/price-impact.util'

export function useWithdrawPriceImpact(params: QuoteParams & { isBalanced: boolean }, expectedLp: Query<Decimal>) {
  const reserves = usePoolReserves(params)
  const { amounts, decimals, supply, isBalanced } = params
  const rates = usePoolRates(params, !isBalanced)
  if (isBalanced) return mapQuery(expectedLp, () => ZERO) // Proportional withdrawals do not exchange coins or charge a withdrawal fee.
  return combineQueries([reserves, rates, expectedLp], (reserves, rates, lpAmount) => {
    if (!amounts || !isComplete(decimals) || !supply || !+supply) return null
    const balanced = scaleReserves(reserves, decimals, lpAmount, supply)
    const balancedValue = rateAdjustedValue(balanced, rates)
    return calculatePriceImpact(rateAdjustedValue(amounts, rates), balancedValue)
  })
}
