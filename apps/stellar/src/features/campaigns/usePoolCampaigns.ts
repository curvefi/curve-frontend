import { asAddress, formatAddress } from '@/stellar/features/connect-wallet/address'
import type { NetworkQuery } from '@/stellar/queries/query-types'
import type { Address } from '@primitives/address.utils'
import { getCampaignsExternalOptions } from '@ui/features/campaigns/campaigns-external.query'
import { getCampaignsPoolsMerklOptions } from '@ui/features/campaigns/campaigns-pools-merkl.query'
import { combineCampaigns } from '@ui/features/campaigns/campaigns.query'
import { groupCampaignsByAddress } from '@ui/features/campaigns/campaigns.utils'
import { combineQueryState } from '@ui/features/queries/combine'
import { useQuery } from '@ui/features/queries/query-hooks'

const formatCampaignAddress = (address: string) => asAddress(formatAddress(address as Address))

export const usePoolCampaigns = ({ network }: NetworkQuery) => {
  const external = useQuery(getCampaignsExternalOptions(formatCampaignAddress))
  const merkl = useQuery({
    ...getCampaignsPoolsMerklOptions({}),
    select: groupCampaignsByAddress(formatCampaignAddress),
  })

  return {
    ...combineQueryState(external, merkl),
    data: combineCampaigns([external.data, merkl.data], network),
    isFetching: external.isFetching || merkl.isFetching,
    refetch: () => Promise.all([external.refetch(), merkl.refetch()]),
  }
}
