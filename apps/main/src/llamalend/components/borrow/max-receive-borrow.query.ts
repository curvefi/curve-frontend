import type { BorrowForm } from '@/llamalend/components/borrow/borrow.types'
import { borrowFormValidationGroup } from '@/llamalend/components/borrow/borrow.validation'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { type ChainQuery, type PoolQuery, queryFactory, type UserQuery } from '@ui-kit/lib/model'
import { curveApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import { LlamaMarketType } from '@ui-kit/types/market'

type BorrowMaxReceiveQuery = ChainQuery<IChainId> & PoolQuery & UserQuery & BorrowForm
type BorrowMaxReceiveParams = FieldsOf<BorrowMaxReceiveQuery>

type MarketAndType =
  | [market: MintMarketTemplate, type: LlamaMarketType.Mint]
  | [market: LendMarketTemplate, type: LlamaMarketType.Lend]

function getLlamaMarket(id: string): MarketAndType {
  const lib = requireLib('llamaApi')
  const mintMarket = lib.getMintMarket(id)
  if (mintMarket) return [mintMarket, LlamaMarketType.Mint] as const
  const lendMarket = lib.getLendMarket(id)
  if (lendMarket) return [lendMarket, LlamaMarketType.Lend] as const
  throw new Error(`Market with ID ${id} not found`)
}

type BorrowMaxReceiveResult = {
  maxDebt: string
  maxTotalCollateral: string
  maxLeverage: string
  // collateralFromUserBorrowed: string
  // collateralFromMaxDebt: string
  // avgPrice: string
}

export const { useQuery: useMaxBorrowReceive } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, userBorrowed, userCollateral, range }: BorrowMaxReceiveParams) =>
    [
      'max-borrow-receive',
      { chainId },
      { poolId },
      { userAddress },
      { userBorrowed },
      { userCollateral },
      { range },
    ] as const,
  queryFn: async ({
    poolId,
    userBorrowed = 0,
    userCollateral = 0,
    range,
  }: BorrowMaxReceiveQuery): Promise<BorrowMaxReceiveResult> => {
    const [market, type] = getLlamaMarket(poolId)
    if (type === LlamaMarketType.Lend) {
      return market.leverage.createLoanMaxRecv(userCollateral, userBorrowed, range)
    }
    if (market.leverageV2.hasLeverage()) {
      return market.leverageV2.createLoanMaxRecv(userCollateral, userBorrowed, range)
    }

    console.assert(userBorrowed == 0, `userBorrowed should be 0 for non-leverage mint markets`)
    const { maxBorrowable, maxCollateral, leverage, routeIdx } = await market.leverage.createLoanMaxRecv(
      userCollateral,
      range,
    )
    return { maxDebt: maxBorrowable, maxTotalCollateral: maxCollateral, maxLeverage: leverage }
  },
  staleTime: '1m',
  validationSuite: createValidationSuite(
    ({ chainId, userAddress, userBorrowed, userCollateral, range }: BorrowMaxReceiveParams) => {
      curveApiValidationGroup({ chainId })
      userAddressValidationGroup({ userAddress })
      borrowFormValidationGroup({ userBorrowed, userCollateral, range })
    },
  ),
})
