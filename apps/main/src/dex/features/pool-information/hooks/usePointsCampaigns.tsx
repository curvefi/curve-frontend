import { useMemo } from 'react'
import { type Address } from 'viem'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolCampaignsByAddress } from '@/dex/features/pool-information/hooks/usePoolCampaignsByAddress'
import type { ChainId } from '@/dex/types/main.types'
import { getPointsCampaignRows } from '@evm-ui/features/points-campaigns/points-campaigns.utils'

export const usePointsCampaigns = ({ chainId, poolAddress }: { chainId: ChainId; poolAddress: Address }) => {
  const { data: network } = useNetworkByChain({ chainId })
  const { data: campaigns } = usePoolCampaignsByAddress({ blockchainId: network?.blockchainId, address: poolAddress })

  const rows = useMemo(() => getPointsCampaignRows(campaigns), [campaigns])

  return { rows }
}
