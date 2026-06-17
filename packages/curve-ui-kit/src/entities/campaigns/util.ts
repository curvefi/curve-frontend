import type { CampaignRewards } from './types'

export const extraRewardType = (r: CampaignRewards) =>
  typeof r.multiplier === 'number' ? 'points' : r.multiplier?.endsWith('%') ? 'apr' : 'symbol'
