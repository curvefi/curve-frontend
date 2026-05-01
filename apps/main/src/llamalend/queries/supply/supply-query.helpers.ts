import type { ClaimableReward } from './supply-claimable-rewards.query'

export const hasClaimableRewards = (claimableRewards: ClaimableReward[] | undefined) =>
  (claimableRewards ?? []).some(reward => Number(reward.amount) > 0)
