import useStore from '@main/store/useStore'

const useCampaignRewardsMapper = () => useStore((state) => state.campaigns.campaignRewardsMapper)

export default useCampaignRewardsMapper
