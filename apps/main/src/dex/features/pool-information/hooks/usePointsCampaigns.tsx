import { useMemo } from 'react'
import { type Address } from 'viem'
import { useNetworkByChain } from '@/dex/entities/networks'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import { useCampaignsByAddress } from '@evm-ui/entities/campaigns'
import { getPointsCampaignRows } from '@evm-ui/features/points-campaigns/points-campaigns.utils'

export const usePointsCampaigns = ({
  chainId,
  poolDataCacheOrApi,
}: {
  chainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
}) => {
  const poolAddress = poolDataCacheOrApi.pool.address as Address
  const { data: network } = useNetworkByChain({ chainId })
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId: network?.blockchainId,
    address: poolAddress,
  })

  const rows = useMemo(() => getPointsCampaignRows(campaigns), [campaigns])

  return { rows }
}
