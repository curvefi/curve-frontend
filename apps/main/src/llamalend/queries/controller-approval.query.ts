import { getMarket } from '@/llamalend/llama.utils'
import { getBorrowMoreImplementation } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import { getRepayImplementationType, type RepayFormFields } from '@/llamalend/queries/repay/repay-query.helpers'
import { createEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import { rootKeys, type UserMarketQuery } from '@evm-ui/queries/root-keys'
import { userMarketValidationSuite } from '@evm-ui/queries/validation/user-market-validation'
import { queryFactory } from '@ui/features/queries/factory'
import type { FieldsOf } from '@ui/lib/validation/types'

type Params = FieldsOf<UserMarketQuery>
type LeverageParams = FieldsOf<UserMarketQuery & { leverageEnabled: boolean }>
type LeverageQuery = UserMarketQuery & { leverageEnabled: boolean }

const controllerApprovalKey = ({ chainId, marketId, userAddress }: Params) =>
  [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'controllerApproval'] as const

export const { useQuery: useCreateLoanControllerApproval, fetchQuery: fetchCreateLoanControllerApproval } =
  queryFactory({
    queryKey: ({ chainId, marketId, userAddress, leverageEnabled = false }: LeverageParams) =>
      [...controllerApprovalKey({ chainId, marketId, userAddress }), 'createLoan', { leverageEnabled }] as const,
    queryFn: async ({ marketId, userAddress, leverageEnabled }: LeverageQuery) => {
      const [type, impl] = getCreateLoanImplementation(marketId, leverageEnabled)
      return type === 'zapV2' ? await impl.isControllerApproved(userAddress) : true
    },
    category: 'llamalend.user',
    validationSuite: userMarketValidationSuite,
  })

export const { useQuery: useBorrowMoreControllerApproval, fetchQuery: fetchBorrowMoreControllerApproval } =
  queryFactory({
    queryKey: ({ chainId, marketId, userAddress, leverageEnabled = false }: LeverageParams) =>
      [...controllerApprovalKey({ chainId, marketId, userAddress }), 'borrowMore', { leverageEnabled }] as const,
    queryFn: async ({ marketId, userAddress, leverageEnabled }: LeverageQuery) => {
      const [type, impl] = getBorrowMoreImplementation(marketId, leverageEnabled)
      return type === 'zapV2' ? await impl.isControllerApproved(userAddress) : true
    },
    category: 'llamalend.user',
    validationSuite: userMarketValidationSuite,
  })

export const { useQuery: useRepayControllerApproval, fetchQuery: fetchRepayControllerApproval } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userAddress,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
  }: FieldsOf<UserMarketQuery & RepayFormFields>) =>
    [
      ...controllerApprovalKey({ chainId, marketId, userAddress }),
      'repay',
      // The repayment implementation depends on which sources are used, not their amounts.
      { stateCollateral: !!+(stateCollateral ?? '0') },
      { userCollateral: !!+(userCollateral ?? '0') },
      { userBorrowed: !!+(userBorrowed ?? '0') },
    ] as const,
  queryFn: async ({
    marketId,
    userAddress,
    stateCollateral,
    userCollateral,
    userBorrowed,
  }: UserMarketQuery & RepayFormFields) =>
    getRepayImplementationType(marketId, { stateCollateral, userCollateral, userBorrowed }) === 'zapV2'
      ? await getMarket(marketId).leverageZapV2.isControllerApproved(userAddress)
      : true,
  category: 'llamalend.user',
  validationSuite: userMarketValidationSuite,
})

const { useQuery: useControllerApprovalEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: Params) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'estimateGas.setControllerApproval'] as const,
  queryFn: async ({ marketId }: UserMarketQuery) =>
    await getMarket(marketId).leverageZapV2.estimateGas.setControllerApproval(),
  category: 'llamalend.user',
  validationSuite: userMarketValidationSuite,
})

export const useControllerApprovalEstimateGas = createEstimateGasHook(useControllerApprovalEstimateGasQuery)
