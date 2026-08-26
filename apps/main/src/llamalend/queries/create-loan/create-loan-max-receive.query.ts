import { useMemo } from 'react'
import { getMarket, getZapAddress } from '@/llamalend/llama.utils'
import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import { pickMaxDebtQuery } from '@/llamalend/queries/llamma-query.helpers'
import { getExpectedFn, getRouteById } from '@evm-ui/entities/router-api'
import { type FieldsOf } from '@evm-ui/lib'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import { pickQuery } from '@evm-ui/lib/queries/combine'
import { decimal } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { assert } from '@primitives/objects.utils'
import type { RouteProvider } from '@primitives/router.utils'
import { useQueries } from '@tanstack/react-query'
import type { CreateLoanFormQuery } from '../../features/borrow/types'
import { createLoanQueryValidationSuite } from '../validation/borrow.validation'

type CreateLoanMaxReceiveQuery = Omit<CreateLoanFormQuery, 'userCollateral' | 'debt' | 'routeId'> & {
  userCollateral: Decimal
  userAddress: Address
  router: RouteProvider | null
}
export type CreateLoanMaxReceiveQueryParams = FieldsOf<CreateLoanMaxReceiveQuery>

export type CreateLoanMaxReceiveParams = Omit<CreateLoanMaxReceiveQueryParams, 'router'> & {
  leverageProviders?: readonly RouteProvider[] | undefined
}

export type CreateLoanMaxReceiveResult = {
  maxDebt: Decimal
  router?: RouteProvider
  maxTotalCollateral?: Decimal
  maxLeverage?: Decimal
  userCollateral?: Decimal
  collateralFromUserBorrowed?: Decimal
  collateralFromMaxDebt?: Decimal
  avgPrice?: Decimal
}

const convertNumbers = ({
  maxDebt,
  maxLeverage,
  maxTotalCollateral,
  avgPrice,
  userCollateral,
  collateralFromUserBorrowed,
  collateralFromMaxDebt,
}: { [K in keyof CreateLoanMaxReceiveResult]: string }) => ({
  maxDebt: maxDebt as Decimal,
  maxLeverage: decimal(maxLeverage),
  maxTotalCollateral: decimal(maxTotalCollateral),
  avgPrice: decimal(avgPrice),
  userCollateral: decimal(userCollateral),
  collateralFromUserBorrowed: decimal(collateralFromUserBorrowed),
  collateralFromMaxDebt: decimal(collateralFromMaxDebt),
})

const {
  queryKey: createLoanProviderMaxReceiveKey,
  getQueryOptions: getCreateLoanMaxReceiveOptions,
  invalidate: invalidateCreateLoanProviderMaxReceive,
} = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userAddress,
    userBorrowed = `0`,
    userCollateral = `0`,
    range,
    leverageEnabled,
    slippage,
    router,
  }: CreateLoanMaxReceiveQueryParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'createLoanMaxRecv',
      { userBorrowed },
      { userCollateral },
      { range },
      { leverageEnabled },
      { slippage },
      { router },
    ] as const,
  queryFn: async ({
    chainId,
    marketId,
    userAddress,
    userBorrowed = `0`,
    userCollateral = `0`,
    range,
    leverageEnabled,
    slippage,
    router: routerProvider,
  }: CreateLoanMaxReceiveQuery): Promise<CreateLoanMaxReceiveResult> => {
    const market = getMarket(marketId)
    const [type, impl] = getCreateLoanImplementation(market, leverageEnabled)
    switch (type) {
      case 'zapV2': {
        const router = assert(routerProvider, 'No router enabled')
        const zapAddress = getZapAddress(market)
        const getExpected = getExpectedFn({ chainId, router, userAddress, zapAddress, slippage })
        const result = await impl.createLoanMaxRecv({ userCollateral, range, getExpected })
        return { router, ...convertNumbers(result) }
      }
      case 'V0': {
        assert(!+userBorrowed, `userBorrowed must be 0 for non-leverage mint markets`)
        const result = await impl.createLoanMaxRecv(userCollateral, range)
        const { maxBorrowable, maxCollateral } = result // leverage and routeIdx fields are unused
        return convertNumbers({ maxDebt: maxBorrowable, maxTotalCollateral: maxCollateral })
      }
      case 'unleveraged':
        return convertNumbers({ maxDebt: await impl.createLoanMaxRecv(userCollateral, range) })
    }
  },
  category: 'llamalend.createLoan',
  validationSuite: createLoanQueryValidationSuite({
    debtRequired: false,
    collateralRequired: true,
    isMaxDebtRequired: false,
    isLeverageRequired: false,
    ignoreMaxCollateral: true, // allow users to calculate max receive before they have collateral
  }),
})

export const createLoanRouteMaxReceiveKey = (params: CreateLoanMaxReceiveParams & { routeId?: string | null }) =>
  createLoanProviderMaxReceiveKey({ ...params, router: params.routeId ? getRouteById(params.routeId).router : null })

const getMaxReceiveProviders = ({ marketId, leverageEnabled, leverageProviders }: CreateLoanMaxReceiveParams) => {
  if (!marketId || leverageEnabled == null) return []
  const [type] = getCreateLoanImplementation(marketId, leverageEnabled)
  return type === 'zapV2' ? (leverageProviders ?? []) : [null]
}

export const useCreateLoanMaxReceiveQueries = (params: CreateLoanMaxReceiveParams) =>
  useQueries({
    queries: useMemo(
      () => getMaxReceiveProviders(params).map(router => getCreateLoanMaxReceiveOptions({ ...params, router })),
      [params],
    ),
    combine: results => pickQuery(results, pickMaxDebtQuery),
  })

export const invalidateCreateLoanMaxReceive = async (params: CreateLoanMaxReceiveParams) =>
  await Promise.all(
    getMaxReceiveProviders(params).map(router => invalidateCreateLoanProviderMaxReceive({ ...params, router })),
  )
