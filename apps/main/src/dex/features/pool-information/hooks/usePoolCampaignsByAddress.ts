import { getAddress } from 'viem'
import { usePoolCampaigns } from '@/dex/hooks/usePoolCampaigns'
import { useCampaignsByAddress } from '@evm-ui/queries/campaigns/campaigns.query'
import type { Address } from '@primitives/address.utils'
import type { Nullish } from '@primitives/objects.utils'

/** Hook for accessing the campaigns of a DEX pool, optionally filtered by network. */
export const usePoolCampaignsByAddress = ({
  address,
  blockchainId,
}: {
  address: Address | Nullish
  blockchainId: string
}) => useCampaignsByAddress(usePoolCampaigns({ blockchainId }), { address, formatAddress: getAddress })
