import useStore from '@/dex/store/useStore'

const useCampaignRewardsMapper = () => useStore((state) => state.campaigns.campaignRewardsMapper)

export default useCampaignRewardsMapper
