import { resetIsAvailableQueryKey } from '@/llamalend/queries/reset/reset-is-available.query'
import { getResetImplementation } from '@/llamalend/queries/reset/reset-query.helpers'
import {
  type ResetParams,
  type ResetQuery,
  resetValidationSuite,
} from '@/llamalend/queries/validation/reset.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { Range } from '@ui-kit/types/util'

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
