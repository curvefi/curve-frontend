import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { Query } from '@ui-kit/types/util'
import { decimalGreaterThan } from '@ui-kit/utils'
import { SLIPPAGE, type SlippageType } from '../SlippageSettings/slippage.utils'

/** Threshold above which price impact blocks the transaction (shown as red alert) */
const HIGH_PRICE_IMPACT_CRITICAL_THRESHOLD = '25' satisfies Decimal

/**
 * Returns the alert severity based on price impact vs. slippage tolerance and critical threshold:
 * - 'error' if price impact exceeds HIGH_PRICE_IMPACT_CRITICAL_THRESHOLD (blocks the transaction)
 * - 'warning' if price impact exceeds the slippage tolerance
 * - null if no alert is needed
 */
export const getPriceImpactSeverity = (
  { data: priceImpact }: Pick<Query<Decimal | null>, 'data'>,
  { slippage, slippageType }: { slippage: Decimal | null | undefined; slippageType: SlippageType },
): 'error' | 'warning' | null =>
  decimalGreaterThan(priceImpact ?? '0', HIGH_PRICE_IMPACT_CRITICAL_THRESHOLD)
    ? 'error'
    : decimalGreaterThan(priceImpact ?? '0', slippage ?? SLIPPAGE[slippageType].default)
      ? 'warning'
      : null

/**
 * Defines whether to block the transaction due to the price impact.
 * Returns true if the price impact exceeds the critical threshold or if the price impact data is null (query loading or disabled).
 * We don't check the isLoading property as the query will be disabled until maxDebt is calculated.
 */
export const shouldBlockTransaction = (
  priceImpact: Query<Decimal | null>,
  {
    slippage,
    leverageEnabled,
    slippageType,
  }: { slippage: Decimal | null | undefined; leverageEnabled: boolean | undefined; slippageType: SlippageType },
) =>
  (leverageEnabled == true && priceImpact.data == null) ||
  getPriceImpactSeverity(priceImpact, { slippage, slippageType }) === 'error'

export const getPriceImpactDisplay = (
  priceImpact: Query<Decimal | null> | undefined,
  { slippage, slippageType }: { slippage: Decimal | null | undefined; slippageType: SlippageType },
) => {
  const severity = priceImpact && getPriceImpactSeverity(priceImpact, { slippage, slippageType })
  return {
    label: severity ? t`High price impact` : t`Price impact`,
    color: severity ? { error: 'error', warning: 'warning.main' }[severity] : undefined,
  }
}
