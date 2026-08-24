import { useMemo } from 'react'
import { getMarket, getZapAddress } from '@/llamalend/llama.utils'
import { getBorrowMoreImplementation } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import type { BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { borrowMoreValidationGroup } from '@/llamalend/queries/validation/borrow-more.validation'
import { getExpectedFn } from '@evm-ui/entities/router-api'
import { createValidationSuite, type FieldsOf } from '@evm-ui/lib'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import { combineQueries } from '@evm-ui/lib/queries/combine'
import type { Query } from '@evm-ui/types/util'
import { decimal, decimalCompare } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'
import { assert } from '@primitives/objects.utils'
import type { RouteProvider } from '@primitives/router.utils'
import { useQueries } from '@tanstack/react-query'

export type BorrowMoreMaxReceiveResult = {
  maxDebt: Decimal
  router?: RouteProvider
  maxTotalCollateral?: Decimal
  userCollateral?: Decimal
  collateralFromUserBorrowed?: Decimal
  collateralFromMaxDebt?: Decimal
  avgPrice?: Decimal
}

type BorrowMoreMaxReceiveQuery<ChainId = number> = BorrowMoreQuery<ChainId> & {
  router: RouteProvider | null
}
export type BorrowMoreMaxReceiveQueryParams<ChainId = number> = FieldsOf<BorrowMoreMaxReceiveQuery<ChainId>>

export type BorrowMoreMaxReceiveParams<ChainId = number> = Omit<BorrowMoreMaxReceiveQueryParams<ChainId>, 'router'> & {
  leverageProviders?: readonly RouteProvider[] | undefined
}

function castFieldsToDecimal(foo: {
  maxDebt: string
  router?: RouteProvider
  maxTotalCollateral: string
  userCollateral: string
  collateralFromUserBorrowed: string
  collateralFromMaxDebt: string
  avgPrice: string
}) {
  const {
    maxDebt,
    router,
    maxTotalCollateral,
    userCollateral: userCollateralReceive,
    collateralFromUserBorrowed,
    collateralFromMaxDebt,
    avgPrice,
  } = foo
  return {
    maxDebt: maxDebt as Decimal,
    router,
    maxTotalCollateral: decimal(maxTotalCollateral),
    userCollateral: decimal(userCollateralReceive),
    collateralFromUserBorrowed: decimal(collateralFromUserBorrowed),
    collateralFromMaxDebt: decimal(collateralFromMaxDebt),
    avgPrice: decimal(avgPrice),
  }
}

const { getQueryOptions: getBorrowMoreMaxReceiveOptions, invalidate: invalidateBorrowMoreProviderMaxReceive } =
  queryFactory({
    queryKey: ({
      chainId,
      marketId,
      userAddress,
      userCollateral = '0',
      userBorrowed = '0',
      leverageEnabled,
      routeId,
      slippage,
      router,
    }: BorrowMoreMaxReceiveQueryParams) =>
      [
        ...rootKeys.userMarket({ chainId, marketId, userAddress }),
        'borrowMoreMaxRecv',
        { userCollateral },
        { userBorrowed },
        { leverageEnabled },
        { routeId },
        { slippage },
        { router },
      ] as const,
    queryFn: async ({
      marketId,
      userCollateral = '0',
      leverageEnabled,
      chainId,
      userAddress,
      slippage,
      router,
    }: BorrowMoreMaxReceiveQuery): Promise<BorrowMoreMaxReceiveResult> => {
      const market = getMarket(marketId)
      const [type, impl] = getBorrowMoreImplementation(market, leverageEnabled)
      switch (type) {
        case 'zapV2': {
          const selectedRouter = assert(router, 'No router enabled')
          return castFieldsToDecimal({
            router: selectedRouter,
            ...(await impl.borrowMoreMaxRecv({
              userCollateral,
              address: userAddress,
              getExpected: getExpectedFn({
                chainId,
                userAddress,
                zapAddress: getZapAddress(market),
                slippage,
                router: selectedRouter,
              }),
            })),
          })
        }
        case 'unleveraged':
          return { maxDebt: (await impl.borrowMoreMaxRecv(userCollateral)) as Decimal }
      }
    },
    category: 'llamalend.borrowMore',
    validationSuite: createValidationSuite((params: BorrowMoreMaxReceiveParams) =>
      borrowMoreValidationGroup(params, {
        leverageRequired: false,
        debtRequired: false,
        maxDebtRequired: false,
        ignoreMaxDebt: true,
      }),
    ),
  })

const getMaxReceiveProviders = ({ marketId, leverageEnabled, leverageProviders }: BorrowMoreMaxReceiveParams) => {
  if (!marketId) return []
  const [type] = getBorrowMoreImplementation(marketId, leverageEnabled)
  return type === 'zapV2' ? (leverageProviders ?? []) : [null]
}

export const useBorrowMoreMaxReceiveQueries = (params: BorrowMoreMaxReceiveParams) =>
  useQueries({
    queries: useMemo(
      () => getMaxReceiveProviders(params).map(router => getBorrowMoreMaxReceiveOptions({ ...params, router })),
      [params],
    ),
    combine: (results: Query<BorrowMoreMaxReceiveResult>[]) =>
      combineQueries(results, (...data) =>
        data.reduce<BorrowMoreMaxReceiveResult | undefined>(
          (max, data) => (decimalCompare(data.maxDebt, max?.maxDebt ?? '0') > 0 ? data : max),
          undefined,
        ),
      ),
  })

export const invalidateBorrowMoreMaxReceive = async (params: BorrowMoreMaxReceiveParams) =>
  await Promise.all(
    getMaxReceiveProviders(params).map(router => invalidateBorrowMoreProviderMaxReceive({ ...params, router })),
  )
