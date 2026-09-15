import { getBalancedWithdrawAmounts, rateAdjustedValue } from '@/stellar/lib/amounts'
import { usePoolRates } from '@/stellar/queries/pool/pool-rates.query'
import { usePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import type { QuoteParams } from '@/stellar/queries/validation/liquidity.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueries } from '@ui/features/queries/combine'
import type { Query } from '@ui/features/queries/util'
import { calculatePriceImpact } from '@ui/lib/price-impact.util'

export const useWithdrawPriceImpact = (params: QuoteParams, expectedBurn: Query<Decimal>) => {
  const reserves = usePoolReserves(params)
  const rates = usePoolRates(params)
  return combineQueries([reserves, rates, expectedBurn], (reserves, rates, burn) => {
    const { amounts, decimals, supply } = params
    if (!amounts || !decimals?.every((value): value is number => value != null) || !supply || !+supply) return undefined
    const balanced = getBalancedWithdrawAmounts(burn, supply, reserves, decimals)
    const balancedValue = rateAdjustedValue(balanced, rates, decimals)
    return calculatePriceImpact(rateAdjustedValue(amounts, rates, decimals), balancedValue)
  })
}
