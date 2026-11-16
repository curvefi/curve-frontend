import { sumBy } from 'lodash'
import { COLLATERAL_REWARDS_CRV_TITLE } from '@/llamalend/constants'
import type { CrvUsdSnapshot } from '@evm-ui/queries/crvusd-snapshots.query'
import type { LendingSnapshot } from '@evm-ui/queries/lending-snapshots.query'
import { type Nullish, notFalsy, recordEntries } from '@primitives/objects.utils'
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
  crvApr: { paidIn: 'crv', label: () => COLLATERAL_REWARDS_CRV_TITLE },
} satisfies Record<
  keyof CollateralYields,
  { paidIn: CollateralYieldAsset; label: (collateralSymbol: string) => string }
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

/** llamalend.js reads the CRV APR on chain, the other yields have no on-chain source. */
export const withOnChainCrvApr = (yields: CollateralYields, crvApr: number) => toCollateralYields({ ...yields, crvApr })

const getShownYields = (yields: CollateralYields, paidIn?: CollateralYieldAsset) =>
  notFalsy(
    ...recordEntries(COLLATERAL_YIELDS).map(([key, { label, ...config }]) => {
      const apr = yields[key]
      return apr != null && (!paidIn || config.paidIn === paidIn) && { label, apr }
    }),
  )

/** Sum of the yields, all of them or only those paid in one asset. Null when the market has none of them. */
export const sumCollateralYields = (yields: CollateralYields, paidIn?: CollateralYieldAsset) => {
  const shownYields = getShownYields(yields, paidIn)
  return shownYields.length > 0 ? sumBy(shownYields, 'apr') : null
}

/** One line per yield the market has that is paid in the asset, for the tooltips that break a sum down. */
export const getCollateralYieldLines = (
  yields: CollateralYields,
  paidIn: CollateralYieldAsset,
  collateralSymbol: string,
) => getShownYields(yields, paidIn).map(({ label, apr }) => ({ label: label(collateralSymbol), apr }))

/** Borrow APR minus what the collateral earns and the borrow campaigns, as a 1:1 estimate. Percent. */
export const getEstimatedNetBorrowApr = (
  borrowApr: number,
  collateralYields: CollateralYields,
  campaignsApr: number | Nullish,
) => borrowApr - (sumCollateralYields(collateralYields) ?? 0) - (campaignsApr ?? 0)
