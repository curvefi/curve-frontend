import { useMemo } from 'react'
import { type Address } from 'viem'
import { useNetworkByChain } from '@/dex/entities/networks'
import type { ChainId } from '@/dex/types/main.types'
import { getPointsCampaignRows } from '@evm-ui/features/points-campaigns/points-campaigns.utils'
import { useCampaignsByAddress } from '@evm-ui/queries/campaigns/campaigns.query'
import type { QueryProp } from '@ui/features/queries/util'

export const usePointsCampaigns = ({
  chainId,
  poolAddress: { data: poolAddress },
}: {
  chainId: ChainId
  poolAddress: QueryProp<Address>
}) => {
  const { data: network } = useNetworkByChain({ chainId })
  const { data: campaigns } = useCampaignsByAddress({ blockchainId: network?.blockchainId, address: poolAddress })

  const rows = useMemo(() => getPointsCampaignRows(campaigns), [campaigns])

  return { rows }
}
