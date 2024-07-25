import useStore from '@/store/useStore'

const useCampaignRewardsMapper = () => useStore((state) => state.campaigns.campaignRewardsMapper)

export default useCampaignRewardsMapper
