import { getRefuelDailyDonations } from '@curvefi/prices-api/refuel'
import type { Address } from '@primitives/address.utils'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys, type ChainNameQuery } from '@ui-kit/lib/model'
import { contractValidationGroup } from '@ui-kit/lib/model/query/contract-validation'

type RefuelDailyDonationsQuery = ChainNameQuery & {
  poolAddress: Address
  start?: number
  end?: number
}

type RefuelDailyDonationsParams = FieldsOf<RefuelDailyDonationsQuery>

export const { useQuery: useRefuelDailyRefuels } = queryFactory({
  queryKey: ({ blockchainId, poolAddress, start, end }: RefuelDailyDonationsParams) =>
    [...rootKeys.chainName({ blockchainId }), 'getRefuelDailyDonations', { poolAddress }, { start }, { end }] as const,
  queryFn: async ({ blockchainId, poolAddress, start, end }: RefuelDailyDonationsQuery) =>
    getRefuelDailyDonations({
      chain: blockchainId,
      poolAddress,
      start,
      end,
    }),
  validationSuite: createValidationSuite(({ blockchainId, poolAddress }: RefuelDailyDonationsParams) => {
    contractValidationGroup({ blockchainId, contractAddress: poolAddress })
  }),
  category: 'analytics.chart',
})
