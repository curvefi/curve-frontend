import { useMemo } from 'react'

import useStore from '@/store/useStore'

const useCampaignRewardsMapper = () => {
  const cached = useStore((state) => state.storeCache.campaignRewardsMapper)
  const api = useStore((state) => state.campaigns.campaignRewardsMapper)
  const campaignRewardsMapper = useMemo(() => api ?? cached ?? {}, [api, cached])
  return campaignRewardsMapper
}

export default useCampaignRewardsMapper
