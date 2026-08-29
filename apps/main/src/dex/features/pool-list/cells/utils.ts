import { sum } from 'lodash'
import { LARGE_APY } from '@/dex/constants'
import type { CampaignRewards } from '@evm-ui/entities/campaigns'
import type { useAprToApy, useRateDisplay } from '@evm-ui/hooks/useAprToApy'
import { t } from '@evm-ui/lib/i18n'
import { AVERAGE_CATEGORIES, formatNumber, type NumberFormatCategory } from '@evm-ui/utils'
import type { Amount } from '@primitives/decimal.utils'
import type { PoolRow } from '../types'

const COMPOUND_WINDOW = AVERAGE_CATEGORIES['dex.poolYield.compoundRate'].window
const MAX_CRV_BOOST = '2.5x'
const MAX_POINTS_CAMPAIGNS = 4
type MissingAmount = null | undefined | ''
type RateConverter = ReturnType<typeof useAprToApy>
type RateDisplayValue = ReturnType<typeof useRateDisplay>

/**
 * Formats a V2 pool-list value like `formatNumber`, but uses the configured fallback for zero.
 * Use `formatNumber` directly for tooltip details, where displaying zero is meaningful.
 */
export const formatCellValue = (value: Amount | MissingAmount, category: NumberFormatCategory) =>
  formatNumber(value != null && value !== '' && Number(value) === 0 ? null : value, category)

export const convertPoolRate = (convertAprToApy: RateConverter, apr: number | null | undefined) =>
  convertAprToApy(apr, COMPOUND_WINDOW)
export const getBaseRate = (pool: PoolRow, period: 'daily' | 'weekly', convertAprToApy: RateConverter) =>
  convertPoolRate(convertAprToApy, period === 'daily' ? pool.baseDailyApr : pool.baseWeeklyApr)
export const isVolatileRate = (rate: number | null | undefined) => rate != null && rate > LARGE_APY
export const getCrvRateDescription = (rateDisplay: RateDisplayValue) =>
  rateDisplay === 'apy'
    ? t`CRV LP reward APY (max APY can be reached with max boost of ${MAX_CRV_BOOST})`
    : t`CRV LP reward APR (max APR can be reached with max boost of ${MAX_CRV_BOOST})`

export const getCrvRateRange = ({ crvApr, crvAprBoosted }: PoolRow, convertAprToApy: RateConverter) => {
  const unboostedRate = convertPoolRate(convertAprToApy, crvApr)
  const boostedRate = convertPoolRate(convertAprToApy, crvAprBoosted)

  return unboostedRate && boostedRate ? { unboostedRate, boostedRate } : null
}

export const formatCrvRateRange = (range: ReturnType<typeof getCrvRateRange>) =>
  range
    ? `${formatNumber(range.unboostedRate, 'percent.rate')} → ${formatNumber(range.boostedRate, 'percent.rate')}`
    : formatNumber(null, 'percent.rate')

export const isPointsCampaign = ({ reward, tags }: CampaignRewards) => reward?.type !== 'apr' || tags.includes('points')
export const getPointsCampaigns = ({ campaigns }: PoolRow) => campaigns.filter(isPointsCampaign)
export const getCompactPointsCampaigns = (pool: PoolRow) => getPointsCampaigns(pool).slice(0, MAX_POINTS_CAMPAIGNS)
export const getAprCampaigns = ({ campaigns }: PoolRow) => campaigns.filter(campaign => !isPointsCampaign(campaign))

export const getExtraRewards = ({ extraRewardsApr }: PoolRow) => extraRewardsApr.filter(({ apr }) => apr > 0)
export const getExtraRewardsRate = (pool: PoolRow, convertAprToApy: RateConverter) =>
  sum(getExtraRewards(pool).map(({ apr }) => convertPoolRate(convertAprToApy, apr)))

export const getCampaignRewardsRate = (pool: PoolRow, convertAprToApy: RateConverter) =>
  sum(
    getAprCampaigns(pool).flatMap(({ reward }) =>
      reward?.type === 'apr' ? [convertPoolRate(convertAprToApy, reward.value)] : [],
    ),
  )

export const getRewardsRate = (pool: PoolRow, convertAprToApy: RateConverter) =>
  sum([getExtraRewardsRate(pool, convertAprToApy), getCampaignRewardsRate(pool, convertAprToApy)])

/** Each APR is converted individually rather than as a whole because they are distinct sources of yield. */
export const getNetRate = (pool: PoolRow, convertAprToApy: RateConverter) =>
  sum([
    convertPoolRate(convertAprToApy, pool.baseDailyApr),
    pool.gauge?.isKilled ? null : convertPoolRate(convertAprToApy, pool.crvApr),
    getRewardsRate(pool, convertAprToApy),
  ])
