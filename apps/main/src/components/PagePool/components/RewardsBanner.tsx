import useStore from '@/store/useStore'

import RewardsBannerComp from '@/ui/PointsRewards/RewardsBannerComp'

const RewardsBanner: React.FC<{ poolAddress: string }> = ({ poolAddress }) => {
  const rewardsPool = useStore((state) => state.rewards.rewardsMapper[poolAddress])

  return rewardsPool ? <RewardsBannerComp rewardsPool={rewardsPool} /> : null
}

export default RewardsBanner
