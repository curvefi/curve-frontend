import { rootKeys, type UserMarketQuery } from '@evm-ui/queries/root-keys'
import { userMarketValidationSuite } from '@evm-ui/queries/validation/user-market-validation'
import { queryFactory } from '@ui/features/queries/factory'
import type { FieldsOf } from '@ui/lib/validation/types'
import { getCreateLoanImplementation } from './create-loan-query.helpers'

type LeverageParams = FieldsOf<UserMarketQuery & { leverageEnabled: boolean }>
type LeverageQuery = UserMarketQuery & { leverageEnabled: boolean }

export const { useQuery: useCreateLoanControllerApproval, fetchQuery: fetchCreateLoanControllerApproval } =
  queryFactory({
    queryKey: ({ chainId, marketId, userAddress, leverageEnabled = false }: LeverageParams) => ({
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      name: 'createLoanIsControllerApproved',
      leverageEnabled,
    }),
    queryFn: async ({ marketId, userAddress, leverageEnabled }: LeverageQuery) => {
      const [type, impl] = getCreateLoanImplementation(marketId, leverageEnabled)
      return type !== 'zapV2' || (await impl.isControllerApproved(userAddress))
    },
    category: 'llamalend.user',
    validationSuite: userMarketValidationSuite,
  })
