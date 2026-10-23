import { groupBy } from 'lodash'
import type { NetworkQuery } from '@/stellar/queries/query-types'
import type { Address } from '@primitives/address.utils'
import { getCampaignsExternalOptions } from '@ui/features/campaigns/campaigns-external.query'
import { getCampaignsPoolsMerklOptions } from '@ui/features/campaigns/campaigns-pools-merkl.query'
import { combineCampaigns } from '@ui/features/campaigns/campaigns.query'
import { combineQueryState } from '@ui/features/queries/combine'
import { useQuery } from '@ui/features/queries/query-hooks'

const preserveAddress = (address: string) => address as Address

export const usePoolCampaigns = ({ network }: NetworkQuery) => {
  const external = useQuery(getCampaignsExternalOptions(preserveAddress))
  const merkl = useQuery({ ...getCampaignsPoolsMerklOptions({}), select: rs => groupBy(rs, r => r.address) })

  return {
    ...combineQueryState(external, merkl),
    data: combineCampaigns([external.data, merkl.data], network),
    isFetching: external.isFetching || merkl.isFetching,
    refetch: () => Promise.all([external.refetch(), merkl.refetch()]),
  }
}
