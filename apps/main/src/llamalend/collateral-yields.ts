import { sumBy } from 'lodash'
import type { CrvUsdSnapshot } from '@evm-ui/queries/crvusd-snapshots.query'
import type { LendingSnapshot } from '@evm-ui/queries/lending-snapshots.query'
import { type Nullish, maybe, notFalsy, recordEntries } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'

/** What the collateral earns while it backs a loan, as APR in percent of the collateral value. Null when the market has none. */
export type CollateralYields = {
  /** Yield of the collateral token itself, like wstETH */
  rebasingApr: number | null
  /** Trading fees of a Curve LP collateral */
  baseApr: number | null
  /** CRV from the gauge of the collateral */
  crvApr: number | null
}

type CollateralYieldAsset = 'collateral' | 'crv'

const COLLATERAL_YIELDS = {
  rebasingApr: { paidIn: 'collateral', label: collateralSymbol => collateralSymbol },
  baseApr: { paidIn: 'collateral', label: () => t`LP base APR` },
  crvApr: { paidIn: 'crv', label: () => 'CRV' },
} satisfies Record<
  keyof CollateralYields,
  { paidIn: CollateralYieldAsset; label: (collateralSymbol: string | Nullish) => string | Nullish }
>

/** A CRV APR of 0, from a gauge without weight, counts as no CRV rewards. */
export const toCollateralYields = ({ crvApr, ...yields }: CollateralYields): CollateralYields => ({
  ...yields,
  crvApr: crvApr || null,
})

export const getSnapshotCollateralYields = (snapshot: LendingSnapshot | CrvUsdSnapshot | undefined) => {
  const lendSnapshot = snapshot && 'collateralAprCrv' in snapshot ? snapshot : undefined
  return toCollateralYields({
    rebasingApr: snapshot?.collateralToken.rebasingYieldApr ?? null,
    baseApr: lendSnapshot?.collateralAprBase ?? null,
    crvApr: lendSnapshot?.collateralAprCrv ?? null,
  })
}

/** The yields the market has, all of them or only those paid in one asset. */
const getYieldsPaidIn = (yields: CollateralYields, paidIn?: CollateralYieldAsset) =>
  notFalsy(
    ...recordEntries(COLLATERAL_YIELDS).map(([key, { label, ...config }]) => {
      const apr = yields[key]
      return apr != null && (!paidIn || config.paidIn === paidIn) && { label, apr }
    }),
  )

/** Sum of the yields, all of them or only those paid in one asset. Null when the market has none of them. */
export const sumCollateralYields = (yields: CollateralYields, paidIn?: CollateralYieldAsset) => {
  const yieldsPaidIn = getYieldsPaidIn(yields, paidIn)
  return yieldsPaidIn.length > 0 ? sumBy(yieldsPaidIn, 'apr') : null
}

/** The label and APR of each yield the market has that is paid in the asset, for the tooltips that break a sum down. */
export const getCollateralYieldBreakdown = (
  yields: CollateralYields,
  paidIn: CollateralYieldAsset,
  collateralSymbol: string | Nullish,
) =>
  notFalsy(
    ...getYieldsPaidIn(yields, paidIn).map(({ label, apr }) =>
      maybe(label(collateralSymbol), label => ({ label, apr })),
    ),
  )

/** Borrow APR minus what the collateral earns and the borrow campaigns, as a 1:1 estimate. Percent. */
export const getEstimatedNetBorrowApr = (
  borrowApr: number,
  collateralYields: CollateralYields,
  campaignsApr: number | Nullish,
) => borrowApr - (sumCollateralYields(collateralYields) ?? 0) - (campaignsApr ?? 0)
