import { useMemo } from 'react'
import useStore from '@/lend/store/useStore'

const useCampaignRewardsMapper = () => {
  const cached = useStore((state) => state.storeCache.campaignRewardsMapper)
  const api = useStore((state) => state.campaigns.campaignRewardsMapper)
  return useMemo(() => api ?? cached ?? {}, [api, cached])
}

export default useCampaignRewardsMapper
