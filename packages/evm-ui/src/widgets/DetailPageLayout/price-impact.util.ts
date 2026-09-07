import { decimalGreaterThan } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'
import { recordEntries } from '@primitives/objects.utils'
import type { Query } from '@ui/features/queries/util'

const MIN_USD_PRICE_IMPACT_WARN = 1000

export type PriceImpact = {
  priceImpact: Decimal | undefined
  tokenInUsd: Decimal | undefined
}

export type PriceImpactLevel = 'caution' | 'warning' | 'error'

/** Thresholds shared by price-impact value emphasis, alerts, and blocking behavior. */
const PRICE_IMPACT_THRESHOLDS = {
  /** Blocks leveraged LlamaLend actions above this price impact. */
  critical: '25',
  error: '1',
  warning: '0.75',
  caution: '0.5',
} as const satisfies Record<'critical' | PriceImpactLevel, Decimal>

const isPriceImpactSignificant = (priceImpact: PriceImpact | Decimal | null | undefined) =>
  !(Number((priceImpact as PriceImpact)?.tokenInUsd) < MIN_USD_PRICE_IMPACT_WARN)

export const getPriceImpactPercent = (priceImpact: PriceImpact | Decimal | null | undefined) =>
  typeof priceImpact === 'string' ? priceImpact : priceImpact?.priceImpact

/** Returns a percentage-only emphasis level without applying the USD significance filter. */
export const getPriceImpactLevel = (priceImpact: PriceImpact | Decimal | null | undefined): PriceImpactLevel | null => {
  const level =
    recordEntries(PRICE_IMPACT_THRESHOLDS).find(([, threshold]) =>
      decimalGreaterThan(getPriceImpactPercent(priceImpact) ?? '0', threshold),
    )?.[0] ?? null
  return level === 'critical' ? 'error' : level
}

export const isHighPriceImpact = (priceImpact: PriceImpact | Decimal | null | undefined) =>
  isPriceImpactSignificant(priceImpact) &&
  decimalGreaterThan(getPriceImpactPercent(priceImpact) ?? '0', PRICE_IMPACT_THRESHOLDS.error)

/**
 * Returns the alert severity based on the warning and critical price impact thresholds:
 * - 'error' if price impact exceeds the critical threshold (blocks the transaction)
 * - 'warning' if price impact exceeds the warning threshold
 * - null if no alert is needed
 */
export const getPriceImpactSeverity = (
  priceImpact: PriceImpact | Decimal | null | undefined,
): 'error' | 'warning' | null =>
  isHighPriceImpact(priceImpact)
    ? decimalGreaterThan(getPriceImpactPercent(priceImpact) ?? '0', PRICE_IMPACT_THRESHOLDS.critical)
      ? 'error'
      : 'warning'
    : null

/**
 * Defines whether to block the transaction due to the price impact.
 * Returns true if the price impact exceeds the critical threshold or if the price impact data is null (query loading or disabled).
 * We don't check the isLoading property as the query will be disabled until maxDebt is calculated.
 */
export const shouldBlockTransaction = (
  priceImpact: Query<PriceImpact | Decimal | null>,
  { leverageEnabled }: { leverageEnabled: boolean | undefined },
) =>
  (leverageEnabled == true && priceImpact.data == null && !priceImpact.error) ||
  (getPriceImpactSeverity(priceImpact.data) === 'error' && isPriceImpactSignificant(priceImpact.data))
