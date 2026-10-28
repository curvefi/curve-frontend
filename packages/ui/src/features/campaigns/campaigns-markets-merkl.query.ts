import type { Address } from '@primitives/address.utils'
import { queryOptions } from '@tanstack/react-query'
import { groupCampaignsByAddress } from '@ui/features/campaigns/campaigns.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { EmptyValidationSuite } from '@ui/lib/validation/lib'
import { fetchMerklRewards } from './merkl'

const { getQueryOptions } = queryFactory({
  queryKey: () => ({ name: 'campaigns-markets-merkl', version: 2 }) as const,
  queryFn: async () => await fetchMerklRewards({ mainProtocolId: 'llamalend', test: false, status: 'LIVE' }),
  validationSuite: EmptyValidationSuite,
  category: 'global.campaigns',
})

export const getCampaignsMarketsMerklOptions = (getAddress: (address: string) => Address, enabled = true) =>
  queryOptions({ ...getQueryOptions({}, enabled), select: groupCampaignsByAddress(getAddress) })
