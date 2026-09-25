import { fetchPositionSnapshot } from '@/llamalend/position-metrics/snapshot'
import { rootKeys, type UserMarketParams, type UserMarketQuery } from '@evm-ui/queries/root-keys'
import { userMarketValidationSuite } from '@evm-ui/queries/validation/user-market-validation'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: usePositionSnapshot, queryKey: getPositionSnapshotKey } = queryFactory({
  queryKey: (params: UserMarketParams) => [...rootKeys.userMarket(params), 'positionSnapshot'] as const,
  queryFn: (params: UserMarketQuery) => fetchPositionSnapshot(params),
  category: 'llamalend.userState',
  validationSuite: userMarketValidationSuite,
})
