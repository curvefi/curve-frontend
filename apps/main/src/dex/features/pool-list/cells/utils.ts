import { sum } from 'lodash'
import { LARGE_RATE } from '@/dex/constants'
import type { CampaignRewards } from '@evm-ui/entities/campaigns'
import { formatNumber, type NumberFormatCategory } from '@evm-ui/utils'
import type { Amount } from '@primitives/decimal.utils'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'
import type { PoolRow } from '../types'

const MAX_CRV_BOOST = '2.5x'
const MAX_POINTS_CAMPAIGNS = 4
type MissingAmount = null | undefined | ''

/**
 * Formats a V2 pool-list value like `formatNumber`, but uses the configured fallback for zero.
 * Use `formatNumber` directly for tooltip details, where displaying zero is meaningful.
 */
export const formatCellValue = (value: Amount | MissingAmount, category: NumberFormatCategory) =>
  formatNumber(value != null && value !== '' && Number(value) === 0 ? null : value, category)

export const isVolatileRate = (rate: number | null | undefined) => rate != null && rate > LARGE_RATE

export const getBaseApr = (pool: PoolRow, period: 'daily' | 'weekly') =>
  period === 'daily' ? pool.baseDailyApr : pool.baseWeeklyApr

export const getCrvAprDescription = () =>
  t`CRV LP reward APR (max APR can be reached with max boost of ${MAX_CRV_BOOST})`
export const getCrvAprRange = ({ crvApr, crvAprBoosted }: PoolRow) =>
  crvApr && crvAprBoosted ? { unboostedRate: crvApr, boostedRate: crvAprBoosted } : null // don't use maybe function as that accepts 0
export const formatCrvAprRange = (range: ReturnType<typeof getCrvAprRange>) =>
  maybe(
    range,
    range =>
      `${formatNumber(range.unboostedRate, 'percent.rate')} → ${formatNumber(range.boostedRate, 'percent.rate')}`,
  ) ?? formatNumber(null, 'percent.rate')

export const isPointsCampaign = ({ reward, tags }: CampaignRewards) => reward?.type !== 'apr' || tags.includes('points')
export const getPointsCampaigns = ({ campaigns }: PoolRow) => campaigns.filter(isPointsCampaign)
export const getCompactPointsCampaigns = (pool: PoolRow) => getPointsCampaigns(pool).slice(0, MAX_POINTS_CAMPAIGNS)
export const getAprCampaigns = ({ campaigns }: PoolRow) => campaigns.filter(campaign => !isPointsCampaign(campaign))

export const getExtraRewards = ({ extraRewardsApr }: PoolRow) => extraRewardsApr.filter(({ apr }) => apr > 0)
export const getExtraRewardsApr = (pool: PoolRow) => sum(getExtraRewards(pool).map(({ apr }) => apr))

export const getCampaignRewardsApr = (pool: PoolRow) =>
  sum(getAprCampaigns(pool).flatMap(({ reward }) => notFalsy(reward?.type === 'apr' && reward.value)))

export const getRewardsApr = (pool: PoolRow) => sum([getExtraRewardsApr(pool), getCampaignRewardsApr(pool)])

export const getNetApr = (pool: PoolRow) =>
  sum([pool.baseDailyApr, pool.gauge?.isKilled ? null : pool.crvApr, getRewardsApr(pool)])
