import { useMemo } from 'react'
import { type Address, getAddress } from 'viem'
import { useNetworkByChain } from '@/dex/entities/networks'
import type { ChainId } from '@/dex/types/main.types'
import { getPointsCampaignRows } from '@evm-ui/features/points-campaigns/points-campaigns.utils'
import { useCampaignsByAddress } from '@evm-ui/queries/campaigns/campaigns.query'

export const usePointsCampaigns = ({ chainId, poolAddress }: { chainId: ChainId; poolAddress: Address }) => {
  const { data: network } = useNetworkByChain({ chainId })
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId: network?.blockchainId,
    address: poolAddress,
    formatAddress: getAddress,
  })

  const rows = useMemo(() => getPointsCampaignRows(campaigns), [campaigns])

  return { rows }
}
