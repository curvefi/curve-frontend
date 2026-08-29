import { sumBy } from 'lodash'
import type { CampaignRewards } from '@evm-ui/entities/campaigns'
import type { CrvUsdSnapshot } from '@evm-ui/entities/crvusd-snapshots'
import type { LendingSnapshot } from '@evm-ui/entities/lending-snapshots'
import type { useAprToApy } from '@evm-ui/hooks/useAprToApy'
import type { ExtraIncentive } from '@evm-ui/types/market'
import type { Range } from '@evm-ui/types/util'
import { decimal, formatNumber, MAINNET_CRV_ADDRESS } from '@evm-ui/utils'
import { calculateAverageRates, type WithTimestamp } from '@evm-ui/utils/averageRates'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, maybes, notFalsy } from '@primitives/objects.utils'

type BorrowRateMetricsParams<TSnapshot extends WithTimestamp = WithTimestamp> = {
  borrowRate: number | null | undefined
  campaignsRate: number | null | undefined
  snapshots: TSnapshot[] | undefined
  getBorrowRate: (snapshot: TSnapshot) => number | null | undefined
  getRebasingYieldApr: (snapshot: TSnapshot) => number | null | undefined
  daysBack: number
}

export const computeTotalRate = (rate: number, rebasingYieldApr: number, campaignsRate: number) =>
  rate - rebasingYieldApr - campaignsRate

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
  campaignsRate,
  snapshots,
  getBorrowRate,
  getRebasingYieldApr,
  daysBack,
}: BorrowRateMetricsParams<TSnapshot>) => {
  const rebasingYieldApr = getLatestSnapshotValue(snapshots, getRebasingYieldApr)
  const totalRate =
    maybe(borrowRate, borrowRate => computeTotalRate(borrowRate, rebasingYieldApr ?? 0, campaignsRate ?? 0)) ?? null

  const averages = calculateAverageRates(snapshots, daysBack, {
    rate: getBorrowRate,
    rebasingYieldApr: getRebasingYieldApr,
  })
  const averageRate = averages?.rate ?? null
  const averageRebasingYieldApr = averages?.rebasingYieldApr ?? null

  return {
    rebasingYieldApr,
    totalRate,
    averageRate,
    averageRebasingYieldApr,
    averageTotalRate:
      maybe(averageRate, averageRate => computeTotalRate(averageRate, averageRebasingYieldApr ?? 0, 0)) ?? null,
  }
}

/** Sum a base rate with optional additional components, returning null if the base is null */
const sumRates = (base: number | null | undefined, ...components: (number | null | undefined)[]) =>
  maybe(base, base => components.reduce<number>((sum, c) => sum + (c ?? 0), base)) ?? null

export const toNumberOrNull = (value: number | string | null | undefined) =>
  maybe(value, value => Number(value)) ?? null

type OnChainSupplyRewardApr = { apr: number; symbol: string; tokenAddress: string }

export const getOnChainExtraIncentiveAprs = (rewardsApr: OnChainSupplyRewardApr[] | undefined) =>
  rewardsApr?.map(reward => reward.apr) ?? []

export const getCampaignAprs = (campaigns: CampaignRewards[] | undefined) =>
  campaigns?.flatMap(campaign =>
    campaign.reward?.type === 'apr' ? [campaign.reward.value] : [],
  ) ?? []

export const sumCampaignsApr = (campaigns: CampaignRewards[] | undefined) =>
  campaigns && campaigns.length > 0 ? sumBy(getCampaignAprs(campaigns)) : null

export const formatSupplyExtraIncentives = ({
  incentives,
  baseRate,
  userRate,
  userBoost,
}: {
  incentives: ExtraIncentive[]
  baseRate?: number | null | undefined
  userRate?: number | null | undefined
  userBoost?: Decimal | null | undefined
}): ExtraIncentive[] =>
  notFalsy(
    baseRate && {
      title: 'CRV',
      percentage: baseRate,
      address: MAINNET_CRV_ADDRESS,
      blockchainId: 'ethereum',
    },
    userRate &&
      baseRate == null && {
        title: maybe(userBoost, b => `CRV (${formatNumber(b, 'multiplier')} veCRV Boost)`) ?? '',
        percentage: userRate,
        address: MAINNET_CRV_ADDRESS,
        blockchainId: 'ethereum',
      },
    ...incentives.map(incentive => incentive.percentage > 0 && incentive),
  )

type SupplyRateMetricsParams = {
  supplyApr: number | null | undefined
  crvBoostApr: Range<number | null> | null | undefined
  rebasingYieldApr: number | null | undefined
  extraIncentivesApr: readonly number[] | null | undefined
  campaignsApr: readonly number[] | null | undefined
  userSupplyBoost?: Decimal | null | undefined
  convertRate: ReturnType<typeof useAprToApy>
}

/**
 * Convert each independent APR component for presentation before adding them into supply totals.
 * Parallels `getBorrowRateMetrics` for the supply side.
 */
export const getSupplyRateMetrics = ({
  supplyApr,
  crvBoostApr,
  rebasingYieldApr,
  extraIncentivesApr,
  campaignsApr,
  userSupplyBoost,
  convertRate,
}: SupplyRateMetricsParams) => {
  const [crvMinBoostApr, crvMaxBoostApr] = crvBoostApr ?? []
  const supplyRate = convertRate(supplyApr)
  const crvMinBoostRate = convertRate(crvMinBoostApr)
  const crvMaxBoostRate = convertRate(crvMaxBoostApr)
  const userBoostRate = maybes([crvMinBoostApr, userSupplyBoost], (apr, boost) => convertRate(apr * +boost)) ?? null
  const rebasingYieldRate = convertRate(rebasingYieldApr)
  const extraIncentivesTotalRate = sumBy(extraIncentivesApr ?? [], apr => convertRate(apr))
  const campaignsTotalRate = sumBy(campaignsApr ?? [], apr => convertRate(apr))
  const totalWithoutBoost = sumRates(
    supplyRate,
    rebasingYieldRate,
    extraIncentivesTotalRate,
    campaignsTotalRate,
  )

  return {
    supplyRate,
    supplyRateCrvMinBoost: crvMinBoostRate,
    supplyRateCrvMaxBoost: crvMaxBoostRate,
    userBoostRate,
    rebasingYieldRate,
    extraIncentivesTotalRate,
    totalMinBoost: sumRates(totalWithoutBoost, crvMinBoostRate),
    totalMaxBoost: sumRates(totalWithoutBoost, crvMaxBoostRate),
    totalUserBoost: maybes([totalWithoutBoost, userBoostRate], (total, boost) => sumRates(total, boost)) ?? null,
  }
}

export const getSupplyRateAverageMetrics = ({
  snapshots,
  daysBack,
  convertRate,
}: {
  snapshots: LendingSnapshot[] | undefined
  daysBack: number
  convertRate: ReturnType<typeof useAprToApy>
}) => {
  const averages = calculateAverageRates(snapshots, daysBack, {
    supplyRate: ({ lendApr }) => convertRate(Number(lendApr) * 100),
    rebasingYieldRate: ({ borrowedToken }) => convertRate(borrowedToken.rebasingYieldApr),
    crvMinBoostRate: ({ lendAprCrv0Boost }) => convertRate(lendAprCrv0Boost * 100),
    crvMaxBoostRate: ({ lendAprCrvMaxBoost }) => convertRate(lendAprCrvMaxBoost * 100),
    extraIncentivesRate: ({ extraRewardApr }) => sumBy(extraRewardApr, reward => convertRate(reward.rate)),
  })

  const averageTotalWithoutBoost = sumRates(
    averages?.supplyRate,
    averages?.rebasingYieldRate,
    averages?.extraIncentivesRate,
  )

  return {
    averageLendRate: averages?.supplyRate ?? null,
    averageRateCrvMinBoost: averages?.crvMinBoostRate ?? null,
    averageRateCrvMaxBoost: averages?.crvMaxBoostRate ?? null,
    averageUserBoostRate: null,
    averageRebasingYieldRate: averages?.rebasingYieldRate ?? null,
    averageExtraIncentivesRate: averages?.extraIncentivesRate ?? null,
    totalAverageMinBoost: sumRates(averageTotalWithoutBoost, averages?.crvMinBoostRate),
    totalAverageMaxBoost: sumRates(averageTotalWithoutBoost, averages?.crvMaxBoostRate),
    totalAverageUserBoost: null,
  }
}

export const convertRates = ({ borrowApr, lendApr }: {
  borrowApr: string
  lendApr: string
}) => ({
  borrowApr: decimal(borrowApr),
  lendApr: decimal(lendApr),
})
