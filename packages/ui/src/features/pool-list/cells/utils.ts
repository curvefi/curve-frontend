import type { Amount } from '@primitives/decimal.utils'
import { formatNumber, type NumberFormatCategory } from '@primitives/number.utils'
import { type Nullish, maybe } from '@primitives/objects.utils'
import type { CampaignRewards } from '@ui/features/campaigns/types'
import { t } from '@ui/lib/i18n'
import { MAX_DISPLAY_RATE_PERCENT } from '@ui/lib/rates.utils'
import type { PoolRow, PoolRowData } from '../types'

const MAX_CRV_BOOST = '2.5x'
const MAX_POINTS_CAMPAIGNS = 4
type MissingAmount = Nullish | ''

/**
 * Formats a V2 pool-list value like `formatNumber`, but uses the configured fallback for zero.
 * Use `formatNumber` directly for tooltip details, where displaying zero is meaningful.
 */
export const formatCellValue = (value: Amount | MissingAmount, category: NumberFormatCategory) =>
  formatNumber(value != null && value !== '' && Number(value) === 0 ? null : value, category)

export const isVolatileRate = (rate: number | Nullish) => rate != null && rate > MAX_DISPLAY_RATE_PERCENT

export const getBaseApr = (pool: PoolRow, period: 'daily' | 'weekly') =>
  period === 'daily' ? pool.baseDailyApr : pool.baseWeeklyApr

export const getCrvAprDescription = () =>
  t`CRV LP reward APR (max APR can be reached with max boost of ${MAX_CRV_BOOST})`
export const getCrvAprRange = ({ crvApr, crvAprBoosted }: PoolRowData) =>
  crvApr && crvAprBoosted ? { unboostedRate: crvApr, boostedRate: crvAprBoosted } : null // don't use maybe function as that accepts 0

export const formatCrvAprRange = (range: ReturnType<typeof getCrvAprRange>) =>
  maybe(
    range,
    range =>
      `${formatNumber(range.unboostedRate, 'percent.rate')} → ${formatNumber(range.boostedRate, 'percent.rate')}`,
  ) ?? formatNumber(null, 'percent.rate')

const isPointsCampaign = ({ reward, tags }: CampaignRewards) => reward?.type !== 'apr' || tags.includes('points')
export const getPointsCampaigns = ({ campaigns }: PoolRow) => campaigns?.filter(isPointsCampaign)
export const getCompactPointsCampaigns = (pool: PoolRow) => getPointsCampaigns(pool)?.slice(0, MAX_POINTS_CAMPAIGNS)
export const getAprCampaigns = ({ campaigns }: Pick<PoolRow, 'campaigns'>) =>
  campaigns?.filter(campaign => !isPointsCampaign(campaign))

export const getExtraRewards = ({ extraRewardsApr }: PoolRow) => extraRewardsApr.filter(({ apr }) => apr > 0)

const getIncentivesItems = (pool: PoolRow) => {
  const extraRewards = getExtraRewards(pool)
  const campaigns = getAprCampaigns(pool)
  const unboostedCrvRate = pool.gauge?.isKilled ? null : pool.crvApr
  const hasCrvRate = unboostedCrvRate != null && unboostedCrvRate !== 0

  if (!hasCrvRate && !extraRewards.length && !campaigns?.length) return null
  else return { incentivesRate: pool.incentivesApr, extraRewards, campaigns, unboostedCrvRate }
}

export const getNetRateTooltipData = (pool: PoolRow) => ({
  blockchainId: pool.blockchainId,
  baseRate: getBaseApr(pool, 'daily'),
  netRate: pool.netApr,
  crvRateRange: pool.gauge?.isKilled ? null : getCrvAprRange(pool),
  maxNetRate: pool.netAprBoosted,
  incentiveItems: getIncentivesItems(pool),
  pointsCampaigns: getPointsCampaigns(pool),
})
