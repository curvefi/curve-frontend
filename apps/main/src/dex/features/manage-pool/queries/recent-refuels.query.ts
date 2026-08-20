import { getRefuelDonationEvents } from '@curvefi/prices-api/refuel'
import type { Address } from '@primitives/address.utils'
import { DEFAULT_PAGE_START_INDEX } from '@evm-ui/features/activity-table/utils'
import { createValidationSuite, type FieldsOf } from '@evm-ui/lib'
import { queryFactory, rootKeys, type ChainNameQuery } from '@evm-ui/lib/model'
import { contractValidationGroup } from '@evm-ui/lib/model/query/contract-validation'

export const RECENT_REFUELS_PAGE_SIZE = 10

type RecentRefuelsQuery = ChainNameQuery & {
  poolAddress: Address
  page?: number
  pageSize?: number
}

type RecentRefuelsParams = FieldsOf<RecentRefuelsQuery>

export const { useQuery: useRecentRefuels } = queryFactory({
  queryKey: ({ blockchainId, poolAddress, page, pageSize }: RecentRefuelsParams) =>
    [
      ...rootKeys.chainName({ blockchainId }),
      'getRefuelDonationEvents',
      { poolAddress },
      { page },
      { pageSize },
    ] as const,
  queryFn: async ({
    blockchainId,
    poolAddress,
    page = DEFAULT_PAGE_START_INDEX,
    pageSize = RECENT_REFUELS_PAGE_SIZE,
  }: RecentRefuelsQuery) =>
    getRefuelDonationEvents({
      chain: blockchainId,
      poolAddress,
      page,
      pageSize,
    }),
  validationSuite: createValidationSuite(({ blockchainId, poolAddress }: RecentRefuelsParams) => {
    contractValidationGroup({ blockchainId, contractAddress: poolAddress })
  }),
  category: 'analytics.chart',
  keepPreviousData: true,
})
