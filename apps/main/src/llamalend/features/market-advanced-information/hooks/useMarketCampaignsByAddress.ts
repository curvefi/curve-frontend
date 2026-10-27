import { getAddress } from 'viem'
import { useMarketCampaigns } from '@/llamalend/features/market-list/hooks/useMarketCampaigns'
import { useCampaignsByAddress } from '@evm-ui/queries/campaigns/campaigns.query'
import type { Address } from '@primitives/address.utils'
import type { Nullish } from '@primitives/objects.utils'

/** Like {@link usePoolCampaignsByAddress}, for a LlamaLend controller, vault or AMM */
export const useMarketCampaignsByAddress = ({
  address,
  blockchainId,
}: {
  address: Address | Nullish
  blockchainId: string | Nullish
}) => useCampaignsByAddress(useMarketCampaigns({ blockchainId }), { address, formatAddress: getAddress })
