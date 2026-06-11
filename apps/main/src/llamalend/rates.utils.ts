import { sumBy } from 'lodash'
import { maybe, maybes, notFalsy } from '@primitives/objects.utils'
import type { CrvUsdSnapshot } from '@ui-kit/entities/crvusd-snapshots'
import type { LendingSnapshot } from '@ui-kit/entities/lending-snapshots'
import type { ExtraIncentive } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { decimal, defaultNumberFormatter, MAINNET_CRV_ADDRESS } from '@ui-kit/utils'
import { calculateAverageRates, type WithTimestamp } from '@ui-kit/utils/averageRates'
import { aprToApy } from '@ui-kit/utils/rates'
import type { SupplyExtraIncentive } from './rates.types'

export { aprToApy } from '@ui-kit/utils/rates'

type BorrowRateMetricsParams<TSnapshot extends WithTimestamp = WithTimestamp> = {
  borrowRate: number | null | undefined
  snapshots: TSnapshot[] | undefined
  getBorrowRate: (snapshot: TSnapshot) => number | null | undefined
  getRebasingYield: (snapshot: TSnapshot) => number | null | undefined
  daysBack: number
}

export const computeTotalRate = (rate: number, rebasingYield: number) => rate - rebasingYield

export const getSnapshotBorrowApr = ({ borrowApr }: LendingSnapshot | CrvUsdSnapshot) => borrowApr
export const getSnapshotCollateralRebasingYieldApr = <
  TSnapshot extends { collateralToken: { rebasingYieldApr: number | null | undefined } },
>(
  snapshot: TSnapshot,
) => snapshot.collateralToken.rebasingYieldApr

export const getLatestSnapshotValue = <TSnapshot extends WithTimestamp, TValue>(
  snapshots: TSnapshot[] | undefined,
  getValue: (snapshot: TSnapshot) => TValue | null | undefined,
) => {
  const latest = snapshots?.at(-1)
  return latest ? (getValue(latest) ?? null) : null
}
/**
 * Get the borrow rate metrics for a given borrow rate and snapshots, like average rate, total net rate.
 */
export const getBorrowRateMetrics = <TSnapshot extends WithTimestamp = WithTimestamp>({
  borrowRate,
  snapshots,
  getBorrowRate,
  getRebasingYield,
  daysBack,
}: BorrowRateMetricsParams<TSnapshot>) => {
  const rebasingYield = getLatestSnapshotValue(snapshots, getRebasingYield)
  const totalRate = maybe(borrowRate, borrowRate => computeTotalRate(borrowRate, rebasingYield ?? 0)) ?? null

  const averages = calculateAverageRates(snapshots, daysBack, {
    rate: getBorrowRate,
    rebasingYield: getRebasingYield,
  })
  const averageRate = averages?.rate ?? null
  const averageRebasingYield = averages?.rebasingYield ?? null

  return {
    rebasingYield,
    totalRate,
    averageRate,
    averageRebasingYield,
    averageTotalRate:
      maybe(averageRate, averageRate => computeTotalRate(averageRate, averageRebasingYield ?? 0)) ?? null,
  }
}

/** Sum a base rate with optional additional components, returning null if the base is null */
const sumRates = (base: number | null | undefined, ...components: (number | null | undefined)[]) =>
  maybe(base, base => components.reduce<number>((sum, c) => sum + (c ?? 0), base)) ?? null

export const toNumberOrNull = (value: number | string | null | undefined) =>
  maybe(value, value => Number(value)) ?? null

type OnChainSupplyRewardApr = { apy: number; symbol: string; tokenAddress: string }

export const sumOnChainExtraIncentivesApy = (rewardsApr: OnChainSupplyRewardApr[] | undefined) =>
  rewardsApr && rewardsApr.length > 0 ? sumBy(rewardsApr, reward => aprToApy(reward.apy)!) : null

const displayUserBoost = (userBoost: number | null | undefined) =>
  userBoost == null ? '' : ' (' + defaultNumberFormatter(userBoost) + 'x veCRV Boost)'

export const formatSupplyExtraIncentives = ({
  incentives,
  baseRate,
  userRate,
  userBoost,
}: {
  incentives: ExtraIncentive[]
  baseRate?: number | null | undefined
  userRate?: number | null | undefined
  userBoost?: number | null | undefined
}): SupplyExtraIncentive[] =>
  notFalsy(
    baseRate && {
      title: 'CRV',
      percentage: baseRate,
      address: MAINNET_CRV_ADDRESS,
      blockchainId: 'ethereum',
    },
    userRate &&
      baseRate == null && {
        title: 'CRV' + displayUserBoost(userBoost),
        percentage: userRate,
        address: MAINNET_CRV_ADDRESS,
        blockchainId: 'ethereum',
      },
    ...incentives.map(incentive => incentive.percentage > 0 && incentive),
  )

type SupplyRateMetricsParams = {
  supplyApy: number | null | undefined
  crvBoostApr: Range<number> | null | undefined
  rebasingYieldApy: number | null | undefined
  extraIncentivesApy: number | null | undefined
  userSupplyBoost?: number | null | undefined
}

/**
 * Get the supply rate metrics for a given supply APY and lending snapshots, like average rate, total boosted rates.
 * Parallels `getBorrowRateMetrics` for the supply side.
 */
export const getSupplyApyMetrics = ({
  supplyApy,
  crvBoostApr,
  rebasingYieldApy,
  extraIncentivesApy,
  userSupplyBoost,
}: SupplyRateMetricsParams) => {
  rebasingYieldApy = rebasingYieldApy ?? null
  extraIncentivesApy = extraIncentivesApy ?? 0

  const [crvMinBoostApr, crvMaxBoostApr] = crvBoostApr ?? []

  const crvMinBoostApy = aprToApy(crvMinBoostApr)
  const crvMaxBoostApy = aprToApy(crvMaxBoostApr)
  const userBoostApy = maybes([crvMinBoostApr, userSupplyBoost], ([apr, boost]) => aprToApy(apr * boost)) ?? null

  const totalWithoutBoost = sumRates(supplyApy, rebasingYieldApy, extraIncentivesApy)

  return {
    supplyApy,
    supplyApyCrvMinBoost: crvMinBoostApy,
    supplyApyCrvMaxBoost: crvMaxBoostApy,
    userBoostApy,
    rebasingYield: rebasingYieldApy,
    extraIncentivesTotalApy: extraIncentivesApy,
    totalMinBoost: sumRates(totalWithoutBoost, crvMinBoostApy),
    totalMaxBoost: sumRates(totalWithoutBoost, crvMaxBoostApy),
    totalUserBoost: maybes([totalWithoutBoost, userBoostApy], ([total, boost]) => sumRates(total, boost)) ?? null,
  }
}

export const getSupplyApyAverageMetrics = ({
  snapshots,
  daysBack,
}: {
  snapshots: LendingSnapshot[] | undefined
  daysBack: number
}) => {
  const averages = calculateAverageRates(snapshots, daysBack, {
    supplyApy: ({ lendApy }) => Number(lendApy) * 100,
    rebasingYieldApy: ({ borrowedToken }) => borrowedToken.rebasingYield,
    crvMinBoostApr: ({ lendAprCrv0Boost }) => lendAprCrv0Boost * 100,
    crvMinBoostApy: ({ lendAprCrv0Boost }) => aprToApy(lendAprCrv0Boost * 100),
    crvMaxBoostApy: ({ lendAprCrvMaxBoost }) => aprToApy(lendAprCrvMaxBoost * 100),
    extraIncentivesApy: ({ extraRewardApr }) => sumBy(extraRewardApr, reward => aprToApy(reward.rate)!),
  })

  const averageTotalWithoutBoost = sumRates(
    averages?.supplyApy,
    averages?.rebasingYieldApy,
    averages?.extraIncentivesApy,
  )

  return {
    averageLendApy: averages?.supplyApy ?? null,
    averageApyCrvMinBoost: averages?.crvMinBoostApy ?? null,
    averageApyCrvMaxBoost: averages?.crvMaxBoostApy ?? null,
    averageUserBoostApy: null,
    averageRebasingYield: averages?.rebasingYieldApy ?? null,
    averageExtraIncentivesApy: averages?.extraIncentivesApy ?? null,
    totalAverageMinBoost: sumRates(averageTotalWithoutBoost, averages?.crvMinBoostApy),
    totalAverageMaxBoost: sumRates(averageTotalWithoutBoost, averages?.crvMaxBoostApy),
    totalAverageUserBoost: null,
  }
}

export const convertRates = ({
  borrowApr,
  borrowApy,
  lendApr,
  lendApy,
}: {
  borrowApr: string
  borrowApy: string
  lendApr: string
  lendApy: string
}) => ({
  borrowApr: decimal(borrowApr),
  borrowApy: decimal(borrowApy),
  lendApy: decimal(lendApy),
  lendApr: decimal(lendApr),
})
