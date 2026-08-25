import { useMemo } from 'react'
import { getMarket, getZapAddress } from '@/llamalend/llama.utils'
import { getBorrowMoreImplementation } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import { pickMaxDebtQuery } from '@/llamalend/queries/max-receive-query.helpers'
import type { BorrowMoreQuery } from '@/llamalend/queries/validation/borrow-more.validation'
import { borrowMoreValidationGroup } from '@/llamalend/queries/validation/borrow-more.validation'
import { getExpectedFn } from '@evm-ui/entities/router-api'
import { createValidationSuite, type FieldsOf } from '@evm-ui/lib'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import { pickQuery } from '@evm-ui/lib/queries/combine'
import { decimal } from '@evm-ui/utils'
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

const castFieldsToDecimal = ({
  maxDebt,
  maxTotalCollateral,
  userCollateral: userCollateralReceive,
  collateralFromUserBorrowed,
  collateralFromMaxDebt,
  avgPrice,
}: {
  maxDebt: string
  maxTotalCollateral: string
  userCollateral: string
  collateralFromUserBorrowed: string
  collateralFromMaxDebt: string
  avgPrice: string
}) => ({
  maxDebt: maxDebt as Decimal,
  maxTotalCollateral: decimal(maxTotalCollateral),
  userCollateral: decimal(userCollateralReceive),
  collateralFromUserBorrowed: decimal(collateralFromUserBorrowed),
  collateralFromMaxDebt: decimal(collateralFromMaxDebt),
  avgPrice: decimal(avgPrice),
})

const { getQueryOptions: getBorrowMoreMaxReceiveOptions, invalidate: invalidateBorrowMoreProviderMaxReceive } =
  queryFactory({
    queryKey: ({
      chainId,
      marketId,
      userAddress,
      userCollateral = '0',
      userBorrowed = '0',
      leverageEnabled,
      slippage,
      router,
    }: BorrowMoreMaxReceiveQueryParams) =>
      [
        ...rootKeys.userMarket({ chainId, marketId, userAddress }),
        'borrowMoreMaxRecv',
        { userCollateral },
        { userBorrowed },
        { leverageEnabled },
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
      router: routerProvider,
    }: BorrowMoreMaxReceiveQuery): Promise<BorrowMoreMaxReceiveResult> => {
      const market = getMarket(marketId)
      const [type, impl] = getBorrowMoreImplementation(market, leverageEnabled)
      switch (type) {
        case 'zapV2': {
          const router = assert(routerProvider, 'No router enabled')
          const zapAddress = getZapAddress(market)
          const getExpected = getExpectedFn({ chainId, userAddress, zapAddress, slippage, router })
          const result = await impl.borrowMoreMaxRecv({ userCollateral, address: userAddress, getExpected })
          return { router, ...castFieldsToDecimal(result) }
        }
        case 'unleveraged':
          return { maxDebt: (await impl.borrowMoreMaxRecv(userCollateral)) as Decimal }
      }
    },
    category: 'llamalend.borrowMore',
    validationSuite: createValidationSuite((params: BorrowMoreMaxReceiveQueryParams) =>
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
    combine: results => pickQuery(results, pickMaxDebtQuery),
  })

export const invalidateBorrowMoreMaxReceive = async (params: BorrowMoreMaxReceiveParams) =>
  await Promise.all(
    getMaxReceiveProviders(params).map(router => invalidateBorrowMoreProviderMaxReceive({ ...params, router })),
  )
