import { useMemo } from 'react'
import { type Address } from 'viem'
import { useNetworkByChain } from '@/dex/entities/networks'
import type { ChainId } from '@/dex/types/main.types'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { getPointsCampaignRows } from '@evm-ui/features/points-campaigns/points-campaigns.utils'
import { useCampaignsByAddress } from '@evm-ui/queries/campaigns'

export const usePointsCampaigns = ({ chainId, pool }: { chainId: ChainId; pool: PoolTemplate }) => {
  const poolAddress = pool.address as Address
  const { data: network } = useNetworkByChain({ chainId })
  const { data: campaigns } = useCampaignsByAddress({ blockchainId: network?.blockchainId, address: poolAddress })

  const rows = useMemo(() => getPointsCampaignRows(campaigns), [campaigns])

  return { rows }
}
