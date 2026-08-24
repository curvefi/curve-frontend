import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { Query } from '@ui-kit/types/util'
import { decimalGreaterThan } from '@ui-kit/utils'
import { SLIPPAGE, type SlippageType } from '../SlippageSettings/slippage.utils'

/** Threshold above which price impact blocks the transaction (shown as red alert) */
const HIGH_PRICE_IMPACT_CRITICAL_THRESHOLD = '25' satisfies Decimal

const MIN_USD_PRICE_IMPACT_WARN = 1000

export type PriceImpact = {
  priceImpact: Decimal | undefined
  tokenInUsd: Decimal | undefined
}

const isPriceImpactSignificant = (priceImpact: PriceImpact | Decimal | null | undefined) =>
  !(Number((priceImpact as PriceImpact)?.tokenInUsd) < MIN_USD_PRICE_IMPACT_WARN)

export const getPriceImpactPercent = (priceImpact: PriceImpact | Decimal | null | undefined) =>
  typeof priceImpact === 'string' ? priceImpact : priceImpact?.priceImpact

/**
 * Returns the alert severity based on price impact vs. slippage tolerance and critical threshold:
 * - 'error' if price impact exceeds HIGH_PRICE_IMPACT_CRITICAL_THRESHOLD (blocks the transaction)
 * - 'warning' if price impact exceeds the slippage tolerance
 * - null if no alert is needed
 */
export const getPriceImpactSeverity = (
  priceImpact: PriceImpact | Decimal | null | undefined,
  { slippage, slippageType }: { slippage: Decimal | null | undefined; slippageType: SlippageType },
): 'error' | 'warning' | null =>
  isPriceImpactSignificant(priceImpact)
    ? decimalGreaterThan(getPriceImpactPercent(priceImpact) ?? '0', HIGH_PRICE_IMPACT_CRITICAL_THRESHOLD)
      ? 'error'
      : decimalGreaterThan(getPriceImpactPercent(priceImpact) ?? '0', slippage ?? SLIPPAGE[slippageType].default)
        ? 'warning'
        : null
    : null

/**
 * Defines whether to block the transaction due to the price impact.
 * Returns true if the price impact exceeds the critical threshold or if the price impact data is null (query loading or disabled).
 * We don't check the isLoading property as the query will be disabled until maxDebt is calculated.
 */
export const shouldBlockTransaction = (
  priceImpact: Query<PriceImpact | Decimal | null>,
  {
    slippage,
    leverageEnabled,
    slippageType,
  }: {
    slippage: Decimal | null | undefined
    leverageEnabled: boolean | undefined
    slippageType: SlippageType
  },
) =>
  (leverageEnabled == true && priceImpact.data == null && !priceImpact.error) ||
  (getPriceImpactSeverity(priceImpact.data, { slippage, slippageType }) === 'error' &&
    isPriceImpactSignificant(priceImpact.data))

export const getPriceImpactDisplay = (
  priceImpact: Query<PriceImpact | Decimal | null> | undefined,
  { slippage, slippageType }: { slippage: Decimal | null | undefined; slippageType: SlippageType | undefined },
) => {
  const severity = priceImpact && slippageType && getPriceImpactSeverity(priceImpact.data, { slippage, slippageType })
  return {
    label: severity ? t`High price impact` : t`Price impact`,
    color: maybe(severity, s => ({ error: 'error', warning: 'warning.main' })[s]),
  }
}
