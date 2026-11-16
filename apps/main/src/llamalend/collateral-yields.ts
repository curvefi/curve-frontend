import { sum } from 'lodash'
import type { CrvUsdSnapshot } from '@evm-ui/queries/crvusd-snapshots.query'
import type { LendingSnapshot } from '@evm-ui/queries/lending-snapshots.query'
import { type Nullish, recordValues } from '@primitives/objects.utils'

/** What the collateral earns while it backs a loan, as APR in percent of the collateral value. Null when the market has none. */
export type CollateralYields = {
  /** Yield of the collateral token itself, like wstETH */
  rebasingApr: number | null
}

export const getSnapshotCollateralYields = (
  snapshot: LendingSnapshot | CrvUsdSnapshot | undefined,
): CollateralYields => ({ rebasingApr: snapshot?.collateralToken.rebasingYieldApr ?? null })

/** Null when the market has none of the yields. */
export const sumCollateralYields = (yields: CollateralYields) => {
  const aprs = recordValues(yields).filter(apr => apr != null)
  return aprs.length > 0 ? sum(aprs) : null
}

/** Borrow APR minus what the collateral earns and the borrow campaigns, as a 1:1 estimate. Percent. */
export const getEstimatedNetBorrowApr = (
  borrowApr: number,
  collateralYields: CollateralYields,
  campaignsApr: number | Nullish,
) => borrowApr - (sumCollateralYields(collateralYields) ?? 0) - (campaignsApr ?? 0)
