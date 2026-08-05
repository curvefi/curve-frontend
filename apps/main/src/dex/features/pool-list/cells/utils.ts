import { sum } from 'lodash'
import { LARGE_APY } from '@/dex/constants'
import type { Amount } from '@primitives/decimal.utils'
import type { CampaignRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { aprToApy, AVERAGE_CATEGORIES, formatNumber, type NumberFormatCategory } from '@ui-kit/utils'
import type { PoolRow } from '../types'

const COMPOUND_WINDOW = AVERAGE_CATEGORIES['dex.poolYield.compoundRate'].window
const MAX_CRV_BOOST = '2.5x'
const MAX_POINTS_CAMPAIGNS = 4
type MissingAmount = null | undefined | ''

/**
 * Formats a V2 pool-list value like `formatNumber`, but uses the configured fallback for zero.
 * Use `formatNumber` directly for tooltip details, where displaying zero is meaningful.
 */
export const formatCellValue = (value: Amount | MissingAmount, category: NumberFormatCategory) =>
  formatNumber(value != null && value !== '' && Number(value) === 0 ? null : value, category)

export const aprToPoolApy = (apr: Parameters<typeof aprToApy>[0]) => aprToApy(apr, COMPOUND_WINDOW)
export const getBaseApy = (pool: PoolRow, period: 'daily' | 'weekly') =>
  aprToPoolApy(period === 'daily' ? pool.baseDailyApr : pool.baseWeeklyApr)
export const isVolatileApy = (apy: ReturnType<typeof aprToPoolApy>) => apy != null && apy > LARGE_APY
export const getCrvApyDescription = () =>
  t`CRV LP reward APY (max APY can be reached with max boost of ${MAX_CRV_BOOST})`

export const getCrvApyRange = ({ crvApr, crvAprBoosted }: PoolRow) => {
  const unboostedApy = aprToPoolApy(crvApr)
  const boostedApy = aprToPoolApy(crvAprBoosted)

  return unboostedApy && boostedApy ? { unboostedApy, boostedApy } : null
}

export const formatCrvApyRange = (range: ReturnType<typeof getCrvApyRange>) =>
  range
    ? `${formatNumber(range.unboostedApy, 'percent.rate')} → ${formatNumber(range.boostedApy, 'percent.rate')}`
    : formatNumber(null, 'percent.rate')

export const isPointsCampaign = ({ reward, tags }: CampaignRewards) => reward?.type !== 'apr' || tags.includes('points')
export const getPointsCampaigns = ({ campaigns }: PoolRow) => campaigns.filter(isPointsCampaign)
export const getCompactPointsCampaigns = (pool: PoolRow) => getPointsCampaigns(pool).slice(0, MAX_POINTS_CAMPAIGNS)
export const getAprCampaigns = ({ campaigns }: PoolRow) => campaigns.filter(campaign => !isPointsCampaign(campaign))

export const getExtraRewards = ({ extraRewardsApr }: PoolRow) => extraRewardsApr.filter(({ apr }) => apr > 0)
export const getExtraRewardsApy = (pool: PoolRow) => sum(getExtraRewards(pool).map(({ apr }) => aprToPoolApy(apr)))

export const getCampaignRewardsApy = (pool: PoolRow) =>
  sum(getAprCampaigns(pool).flatMap(({ reward }) => (reward?.type === 'apr' ? [aprToPoolApy(reward.value)] : [])))

export const getRewardsApy = (pool: PoolRow) => sum([getExtraRewardsApy(pool), getCampaignRewardsApy(pool)])

/** Each APR is compounded individually rather as a whole as they're distinctive sources of yield */
export const getNetApy = (pool: PoolRow) =>
  sum([aprToPoolApy(pool.baseDailyApr), pool.gauge?.isKilled ? null : aprToPoolApy(pool.crvApr), getRewardsApy(pool)])
