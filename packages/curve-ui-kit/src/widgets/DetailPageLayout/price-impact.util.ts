import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { Query } from '@ui-kit/types/util'
import { decimalGreaterThan } from '@ui-kit/utils'

/** Threshold above which price impact blocks the transaction (shown as red alert) */
const HIGH_PRICE_IMPACT_CRITICAL_THRESHOLD = '25' satisfies Decimal

/**
 * Returns the alert severity based on price impact vs. slippage tolerance and critical threshold:
 * - 'error' if price impact exceeds HIGH_PRICE_IMPACT_CRITICAL_THRESHOLD (blocks the transaction)
 * - 'warning' if price impact exceeds the slippage tolerance
 * - null if no alert is needed
 */
export const getPriceImpactSeverity = (
  { data: priceImpact }: Query<Decimal | null>,
  { slippage }: { slippage: Decimal | null | undefined },
): 'error' | 'warning' | null => {
  if (priceImpact == null) return null
  if (decimalGreaterThan(priceImpact, HIGH_PRICE_IMPACT_CRITICAL_THRESHOLD)) return 'error'
  if (slippage != null && decimalGreaterThan(priceImpact, slippage)) return 'warning'
  return null
}

/**
 * Defines whether to block the transaction due to the price impact.
 * Returns true if the price impact exceeds the critical threshold or if the price impact data is null (query loading or disabled).
 * We don't check the isLoading property as the query will be disabled until maxDebt is calculated.
 */
export const shouldBlockTransaction = (
  priceImpact: Query<Decimal | null>,
  { slippage, leverageEnabled }: { slippage: Decimal | null | undefined; leverageEnabled: boolean | undefined },
) => (leverageEnabled && priceImpact.data == null) || getPriceImpactSeverity(priceImpact, { slippage }) === 'error'

export const getPriceImpactDisplay = (
  priceImpact: Query<Decimal | null> | undefined,
  { slippage }: { slippage: Decimal | null | undefined },
) => {
  const priceImpactSeverity = priceImpact && getPriceImpactSeverity(priceImpact, { slippage })
  const label = priceImpactSeverity ? t`High price impact` : t`Price impact`
  const color = { error: 'error', warning: 'warning.main' }[priceImpactSeverity!]
  return { label, color }
}
