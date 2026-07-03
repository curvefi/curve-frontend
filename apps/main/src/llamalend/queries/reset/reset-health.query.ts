import { getResetImplementation } from '@/llamalend/queries/reset/reset-query.helpers'
import { resetValidationSuite, type ResetQuery } from '@/llamalend/queries/validation/reset.validation'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import type { FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'

type ResetHealthQuery<ChainId = IChainId> = ResetQuery<ChainId> & { isHealthFull: boolean }
type ResetHealthParams<ChainId = IChainId> = FieldsOf<ResetHealthQuery<ChainId>>

export const { getQueryOptions: getResetHealthOptions } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userBorrowed = '0', isHealthFull }: ResetHealthParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'resetHealth',
      { userBorrowed },
      { isHealthFull },
    ] as const,
  queryFn: async ({ marketId, userAddress, isHealthFull, ...params }: ResetHealthQuery) =>
    (await getResetImplementation(marketId).repayHealth({
      debt: params.userBorrowed,
      address: userAddress,
      shrink: true,
      full: isHealthFull,
    })) as Decimal,
  category: 'llamalend.repay',
  validationSuite: resetValidationSuite,
})
