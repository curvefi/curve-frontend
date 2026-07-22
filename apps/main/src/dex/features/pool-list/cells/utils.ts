import { sum } from 'lodash'
import type { CampaignRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { aprToApy, AVERAGE_CATEGORIES } from '@ui-kit/utils'
import type { PoolRow } from '../types'

const COMPOUND_WINDOW = AVERAGE_CATEGORIES['dex.poolYield.compoundRate'].window
const MAX_CRV_BOOST = '2.50'

export const aprToPoolApy = (apr: Parameters<typeof aprToApy>[0]) => aprToApy(apr, COMPOUND_WINDOW)
export const getGaugeApyDescription = () =>
  t`CRV LP reward APY (max APY can be reached with max boost of ${MAX_CRV_BOOST})`

export const getGaugeApyRange = ({ crvApr, crvAprBoosted }: PoolRow) => {
  const unboostedApy = aprToPoolApy(crvApr)
  const boostedApy = aprToPoolApy(crvAprBoosted)

  return unboostedApy && boostedApy ? { unboostedApy, boostedApy } : null
}

export const isPointsCampaign = ({ reward, tags }: CampaignRewards) => reward?.type !== 'apr' || tags.includes('points')
export const getPointsCampaigns = ({ campaigns }: PoolRow) => campaigns.filter(isPointsCampaign)
export const getAprCampaigns = ({ campaigns }: PoolRow) => campaigns.filter(campaign => !isPointsCampaign(campaign))

export const getExtraRewards = ({ extraRewardsApr }: PoolRow) => extraRewardsApr.filter(({ apr }) => apr > 0)

export const getExtraRewardsApy = (pool: PoolRow) => sum(getExtraRewards(pool).map(({ apr }) => aprToPoolApy(apr)))

export const getCampaignRewardsApy = (pool: PoolRow) =>
  sum(getAprCampaigns(pool).flatMap(({ reward }) => (reward?.type === 'apr' ? [aprToPoolApy(reward.value)] : [])))

export const getRewardsApy = (pool: PoolRow) => sum([getExtraRewardsApy(pool), getCampaignRewardsApy(pool)])

/** Each APR is compounded individually rather as a whole as they're distinctive sources of yield */
export const getNetApy = (pool: PoolRow) =>
  sum([aprToPoolApy(pool.baseDailyApr), pool.gauge?.isKilled ? null : aprToPoolApy(pool.crvApr), getRewardsApy(pool)])
