import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import useStore from '@/loan/store/useStore'
import { useStablecoinConnection } from '@/loan/temp-lib'
import { PageProps, type UrlParams } from '@/loan/types/loan.types'
import { parseParams } from '@/loan/utils/utilsRouter'
import { isLoading } from '@ui-kit/features/connect-wallet'

export function usePageOnMount(chainIdNotRequired?: boolean): PageProps {
  const params = useParams() as UrlParams
  const { connectState, lib: curve = null } = useStablecoinConnection()
  const initCampaignRewards = useStore((state) => state.campaigns.initCampaignRewards)
  const initiated = useStore((state) => state.campaigns.initiated)
  // init campaignRewardsMapper
  // todo: move to hydrate?
  useEffect(() => {
    if (curve && !initiated) {
      initCampaignRewards(curve.chainId)
    }
  }, [initCampaignRewards, curve, initiated])

  return {
    pageLoaded: !isLoading(connectState),
    routerParams: parseParams(params, chainIdNotRequired),
    curve: curve,
  }
}
