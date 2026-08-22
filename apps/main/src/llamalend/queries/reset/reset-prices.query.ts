import { resetIsAvailableQueryKey } from '@/llamalend/queries/reset/reset-is-available.query'
import { getResetImplementation } from '@/llamalend/queries/reset/reset-query.helpers'
import {
  type ResetParams,
  type ResetQuery,
  resetValidationSuite,
} from '@/llamalend/queries/validation/reset.validation'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import type { Range } from '@evm-ui/types/util'
import type { Decimal } from '@primitives/decimal.utils'

export const { useQuery: useResetPrices } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userBorrowed = '0' }: ResetParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'resetPrices', { userBorrowed }] as const,
  queryFn: async ({ marketId, userAddress, ...params }: ResetQuery) =>
    (await getResetImplementation(marketId).repayPrices({
      debt: params.userBorrowed,
      address: userAddress,
      shrink: true,
    })) as Range<Decimal>,
  category: 'llamalend.repay',
  validationSuite: resetValidationSuite,
  dependencies: params => [resetIsAvailableQueryKey(params)],
})
